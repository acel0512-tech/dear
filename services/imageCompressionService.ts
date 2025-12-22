
/**
 * 專業影像壓縮服務
 * 將高解析度檢測照片轉換為適合 AI 分析的輕量化 JPEG 格式
 */
export const compressImage = async (
  base64: string, 
  maxWidth = 1280, 
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 處理 Base64 載入
    img.src = base64;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 保持比例縮放
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (!ctx) return reject(new Error('無法取得 Canvas Context'));

      // 填寫白色背景避免透明圖層轉 JPEG 變黑
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // 輸出為 JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // 除錯資訊 (開發環境可看)
      console.log(`[Image Processor] 原圖: ${Math.round(base64.length / 1024)}KB -> 壓縮後: ${Math.round(compressedDataUrl.length / 1024)}KB`);
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = (err) => {
      console.error('圖片載入失敗:', err);
      reject(new Error('圖片載入失敗，無法進行壓縮'));
    };
  });
};
