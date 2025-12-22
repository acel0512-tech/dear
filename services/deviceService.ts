
/**
 * 設備原生功能服務
 * 處理將照片存入系統相簿、分享報告等動作
 */

// 模組層級的鎖定變數，防止重複觸發系統分享視窗導致 "share() is already in progress"
let isShareInProgress = false;

/**
 * 將 Base64 轉換為 File 物件，以便進行系統分享/儲存
 */
const base64ToFile = (base64: string, fileName: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
};

/**
 * 觸發系統分享/儲存視窗 (iPad/Android 平板適用)
 * 如果瀏覽器支援 Web Share API，將直接呼叫系統儲存
 */
export const saveImageToSystemAlbum = async (base64: string, fileName: string = 'scalp_capture.jpg'): Promise<boolean> => {
  // 防止重複進入
  if (isShareInProgress) {
    console.warn('Share operation is already in progress.');
    return false;
  }

  try {
    isShareInProgress = true;
    const file = base64ToFile(base64, fileName);
    
    // 檢查瀏覽器是否支援分享檔案
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: '儲存頭皮檢測影像',
        text: '訫肌頭皮管理中心 - 檢測影像'
      });
      return true;
    } else {
      // 不支援 Web Share 時的備案：觸發傳統下載
      const link = document.createElement('a');
      link.href = base64;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
  } catch (error: any) {
    // 處理使用者取消分享的情況，不視為錯誤，也不在控制台噴紅字
    if (error.name === 'AbortError') {
      console.log('User cancelled the share operation.');
      return false;
    }
    
    // 處理瀏覽器本身的鎖定錯誤
    if (error.message?.includes('already in progress')) {
      console.warn('System share sheet is already open.');
      return false;
    }

    console.error('Save to system failed:', error);
    return false;
  } finally {
    // 無論成功或失敗，務必釋放鎖定
    isShareInProgress = false;
  }
};
