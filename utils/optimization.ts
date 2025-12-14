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
        el.setAttribute(attr, Math.round(val * scale).toString());
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

// Optimized Single Image Logic (Reusable)
const processImageBlob = (blob: Blob, config: OptimizationConfig, originalName: string): Promise<{blob: Blob, width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject("No Context"); return; }

      // Smart Logic: If it's an icon, don't resize usually, unless explicitly told.
      // For ZIP mode, we apply scale to everything for RAM saving, 
      // but if filename contains 'icon', maybe we skip scaling? 
      // For now, respect config.scale.
      
      const width = Math.round(img.width * config.scale);
      const height = Math.round(img.height * config.scale);

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

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
    
    // We need to process files sequentially or in small batches to avoid crashing browser memory
    const fileKeys = Object.keys(loadedZip.files);
    
    // Map to store which images were scaled, so we can scale matching XMLs
    const scaledImages = new Set<string>(); 

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
          scaledImages.add(filename.replace(/\.[^/.]+$/, "")); // Store filename without extension
        } catch (e) {
          // If fail, keep original
          newZip.file(filename, fileData);
        }
      } 
      // Fix Shaders
      else if (lowerName.endsWith('.frag') || lowerName.endsWith('.vert')) {
        const text = await fileData.text();
        const fixed = fixShaderCode(text);
        newZip.file(filename, fixed);
      }
      // Audio (Skip optimization for now, just copy)
      else {
        // We will process XMLs in a second pass or check now?
        // Actually, we can just copy XML data now, and if we need to scale it, we parse it.
        // Problem: We might encounter XML before PNG in loop.
        // Solution: Better to read XML content, check if we SHOULD scale it (assume yes if config.scale < 1)
        
        if (lowerName.endsWith('.xml') && config.scale < 1) {
           // We assume if user wants to scale ZIP, they want to scale everything.
           // Ideally we match it to a PNG, but blindly scaling XML coords is usually safe if the texture is also scaled.
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

      let width = img.width;
      let height = img.height;

      if (config.mode !== 'icon') {
        width = Math.round(img.width * config.scale);
        height = Math.round(img.height * config.scale);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

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
