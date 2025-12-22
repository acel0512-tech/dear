
import { ScalpImages, MachineAnalysisMetrics } from '../types';

/**
 * Lightweight Image Analysis Service (Canvas API Based)
 * 
 * 使用瀏覽器原生的 Canvas API 進行像素級分析。
 * 這是不依賴外部庫 (如 OpenCV) 最輕量且真實的影像分析方式。
 */

// Helper: Load Image from Base64 to HTMLImageElement
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// Helper: Analyze a single image and return raw scores
// Returns NULL if the image is technically invalid (too dark/bright)
// We REMOVED the "Skin Tone" check to let Gemini handle object recognition.
const processSingleImage = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Resize to smaller dimension for faster processing (performance optimization)
  const width = 300;
  const scale = width / img.width;
  const height = img.height * scale;
  
  canvas.width = width;
  canvas.height = height;
  
  if (!ctx) return null;
  
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  let totalPixels = width * height;
  
  // --- Validation Metrics ---
  let totalBrightness = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  // --- Feature Metrics ---
  let redPixels = 0;
  let shinyPixels = 0;
  let edgeScore = 0;
  let darknessScore = 0;

  // Loop through pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    totalR += r;
    totalG += g;
    totalB += b;
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;

    // --- Feature Extraction ---

    // 1. Redness Detection (Inflammation)
    if (r > g * 1.2 && r > b * 1.2) {
      redPixels++;
    }

    // 2. Sebum/Oil Detection (Specularity)
    if (brightness > 200) { 
       shinyPixels++;
    }

    // 3. Hair Diameter/Darkness proxy
    if (brightness < 80) {
        darknessScore++;
    }
  }

  // --- Validation Checks (是否有意義的照片?) ---
  const avgBrightness = totalBrightness / totalPixels;

  // Rule 1: Too Dark (e.g., Lens cap on) - Avg brightness < 15
  // Rule 2: Too Bright (e.g., Pure light source) - Avg brightness > 250
  
  let isInvalid = false;
  if (avgBrightness < 15) isInvalid = true;
  if (avgBrightness > 250) isInvalid = true;

  if (isInvalid) {
      console.warn("Image rejected by validator: Exposure issue.");
      return null; // Return null only for exposure issues
  }

  // 4. Density Proxy (Simple Edge Detection)
  for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
          const i = (y * width + x) * 4;
          const iRight = (y * width + (x + 1)) * 4;
          const iDown = ((y + 1) * width + x) * 4;
          
          const bright = (data[i] + data[i+1] + data[i+2]) / 3;
          const brightRight = (data[iRight] + data[iRight+1] + data[iRight+2]) / 3;
          const brightDown = (data[iDown] + data[iDown+1] + data[iDown+2]) / 3;

          if (Math.abs(bright - brightRight) > 20 || Math.abs(bright - brightDown) > 20) {
              edgeScore++;
          }
      }
  }

  return {
    redRatio: redPixels / totalPixels,
    oilRatio: shinyPixels / totalPixels,
    densityRatio: edgeScore / totalPixels,
    coverageRatio: darknessScore / totalPixels
  };
};

/**
 * Main Analysis Orchestrator
 */
export const analyzeImagesWithMachineLearning = async (
  images: ScalpImages
): Promise<MachineAnalysisMetrics | null> => {
  
  try {
    const imageSource = images.whiteLight || images.polarizedLight || images.custom;
    
    // If no image provided, return null gracefully
    if (!imageSource) {
      return null;
    }

    const img = await loadImage(imageSource);
    
    const rawMetrics = processSingleImage(img);

    // If validation failed (returned null), propagate null
    if (!rawMetrics) {
        return null;
    }

    // --- Calibrate Raw Data to Real-World Metrics ---
    
    let density = Math.floor(rawMetrics.densityRatio * 450); 
    density = Math.min(Math.max(density, 60), 180); 

    let sebum = Math.floor(rawMetrics.oilRatio * 400); 
    sebum = Math.min(sebum, 90); 

    const rednessPenalty = rawMetrics.redRatio * 200; 
    let health = 100 - Math.floor(rednessPenalty);
    
    let diameter = Math.floor(60 + (rawMetrics.coverageRatio * 50)); 
    diameter = Math.min(Math.max(diameter, 50), 110); 

    let dandruff = 1;
    if (sebum > 30) dandruff = 2;
    if (sebum > 50) dandruff = 3;
    if (health < 60) dandruff += 1; 
    dandruff = Math.min(dandruff, 5);

    const metrics: MachineAnalysisMetrics = {
      hairDensity: density,
      hairDiameter: diameter,
      sebumPercentage: sebum,
      dandruffLevel: dandruff,
      follicleHealth: Math.max(health, 40)
    };

    console.log('[Real-Time Image Analysis Result]', metrics);
    return metrics;

  } catch (error: any) {
    console.warn("Image analysis error:", error.message);
    // On any technical error, return null to allow fallback text in report
    return null;
  }
};
