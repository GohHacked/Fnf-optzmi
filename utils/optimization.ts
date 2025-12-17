import { OptimizationConfig, OptimizedResult } from '../types';
import JSZip from 'jszip';

// Helper to scale XML attributes
const scaleXML = (xmlContent: string, scale: number): string => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const subTextures = xmlDoc.getElementsByTagName("SubTexture");

  const attrsToScale = ['x', 'y', 'width', 'height', 'frameX', 'frameY', 'frameWidth', 'frameHeight'];

  for (let i = 0; i < subTextures.length; i++) {
    const el = subTextures[i];
    attrsToScale.forEach(attr => {
      if (el.hasAttribute(attr)) {
        const val = parseFloat(el.getAttribute(attr) || "0");
        let newVal = Math.round(val * scale);
        
        // Safety check: Don't let width/height be 0 if original wasn't 0
        if ((attr === 'width' || attr === 'height' || attr === 'frameWidth' || attr === 'frameHeight') && val > 0 && newVal === 0) {
            newVal = 1;
        }

        el.setAttribute(attr, newVal.toString());
      }
    });
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
};

// Helper to fix Shaders for Android
const fixShaderCode = (code: string): string => {
  let fixed = code.replace(/precision\s+highp/g, 'precision mediump');
  if (!fixed.includes('precision')) {
    fixed = "precision mediump float;\n" + fixed;
  }
  return fixed;
};

const removeBlackBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const threshold = 15; // Tolerance for "black"

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If pixel is very dark (black), make it transparent
    if (r < threshold && g < threshold && b < threshold) {
      data[i + 3] = 0; // Alpha
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

// Optimized Single Image Logic (Reusable)
const processImageBlob = (blob: Blob, config: OptimizationConfig, originalName: string): Promise<{blob: Blob, width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject("No Context"); return; }

      // Ensure at least 1px dimensions
      let width = Math.max(1, Math.round(img.width * config.scale));
      let height = Math.max(1, Math.round(img.height * config.scale));

      // Don't resize icons usually unless scale is explicitly set very low
      if (config.mode === 'icon' && config.scale > 0.9) {
          width = img.width;
          height = img.height;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Apply Remove Black Background if enabled
      if (config.removeBlack) {
        removeBlackBackground(ctx, width, height);
      }

      canvas.toBlob((b) => {
        if(b) resolve({blob: b, width, height});
        else reject("Blob failed");
      }, config.format, config.quality);
    };
    img.onerror = reject;
  });
};

export const optimizeAsset = async (
  file: File,
  xmlFile: File | null,
  config: OptimizationConfig
): Promise<OptimizedResult> => {

  // --- ZIP MODE ---
  if (config.mode === 'zip' || (file.name.endsWith('.zip'))) {
    const zip = new JSZip();
    const newZip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    
    let totalOriginalSize = 0;
    const fileKeys = Object.keys(loadedZip.files);
    
    for (const filename of fileKeys) {
      const fileEntry = loadedZip.files[filename];
      if (fileEntry.dir) {
        newZip.folder(filename);
        continue;
      }

      const fileData = await fileEntry.async('blob');
      totalOriginalSize += fileData.size;
      const lowerName = filename.toLowerCase();

      // Optimize Images
      if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        try {
          const { blob } = await processImageBlob(fileData, config, filename);
          newZip.file(filename, blob);
        } catch (e) {
          newZip.file(filename, fileData);
        }
      } 
      // Fix Shaders
      else if (lowerName.endsWith('.frag') || lowerName.endsWith('.vert')) {
        const text = await fileData.text();
        const fixed = fixShaderCode(text);
        newZip.file(filename, fixed);
      }
      else {
        // XML Scaling logic
        if (lowerName.endsWith('.xml') && config.scale < 1) {
           const text = await fileData.text();
           const scaled = scaleXML(text, config.scale);
           newZip.file(filename, scaled);
        } else {
           newZip.file(filename, fileData);
        }
      }
    }

    const content = await newZip.generateAsync({type:"blob"});
    return {
      blob: content,
      originalSize: totalOriginalSize,
      optimizedSize: content.size,
      url: URL.createObjectURL(content),
      isZip: true
    };
  }

  // --- SHADER MODE ---
  if (config.mode === 'shader') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fixed = fixShaderCode(content);
        const blob = new Blob([fixed], { type: 'text/plain' });
        resolve({
          blob,
          textData: fixed,
          originalSize: file.size,
          optimizedSize: blob.size,
          url: URL.createObjectURL(blob)
        });
      };
      reader.readAsText(file);
    });
  }

  // --- STANDARD IMAGE MODE ---
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => { img.src = e.target?.result as string; };
    reader.onerror = (err) => reject(err);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Failed to get canvas context')); return; }

      let width = Math.max(1, Math.round(img.width * config.scale));
      let height = Math.max(1, Math.round(img.height * config.scale));

      if (config.mode === 'icon' && config.scale > 0.9) {
          width = img.width;
          height = img.height;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Apply Remove Black Background if enabled
      if (config.removeBlack) {
        removeBlackBackground(ctx, width, height);
      }

      let xmlBlob: Blob | undefined = undefined;
      let xmlUrl: string | undefined = undefined;
      let extraSize = 0;

      const finish = () => {
        canvas.toBlob((blob) => {
            if (blob) {
              resolve({
                blob,
                xmlBlob,
                xmlUrl,
                originalSize: file.size + (xmlFile ? xmlFile.size : 0),
                optimizedSize: blob.size + extraSize,
                url: URL.createObjectURL(blob),
                width,
                height
              });
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          config.format,
          config.quality
        );
      };

      if (config.mode === 'character' && xmlFile) {
        const xmlReader = new FileReader();
        xmlReader.onload = (e) => {
          const xmlContent = e.target?.result as string;
          const newXml = scaleXML(xmlContent, config.scale);
          xmlBlob = new Blob([newXml], { type: 'text/xml' });
          extraSize = xmlBlob.size;
          xmlUrl = URL.createObjectURL(xmlBlob);
          finish();
        };
        xmlReader.readAsText(xmlFile);
      } else {
        finish();
      }
    };
    reader.readAsDataURL(file);
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};