import { functions, isFirebaseConfigured } from '../firebaseConfig';
import { httpsCallable } from "firebase/functions";

interface LinePushPayload {
    userId: string;
    customerName: string;
    reportUrl: string;
    date: string;
}

/**
 * 呼叫 Firebase Cloud Function 來執行 LINE 官方帳號推播
 * 注意：這需要後端部署 'sendLineReport' 函式
 */
export const sendLinePushMessage = async (payload: LinePushPayload): Promise<void> => {
    if (!isFirebaseConfigured) {
        throw new Error("尚未設定 Firebase，無法使用雲端推播功能。");
    }

    if (!functions) {
        throw new Error("Firebase Functions 服務尚未初始化，可能是網路問題或設定錯誤。");
    }

    try {
        const sendReportFunction = httpsCallable(functions, 'sendLineReport');
        const response = await sendReportFunction(payload);
        
        const result = response.data as any;
        if (!result.success) {
            throw new Error(result.message || "LINE API 回傳錯誤");
        }
    } catch (error: any) {
        console.error("LINE Push Error:", error);
        // User-friendly error mapping
        if (error.code === 'not-found') {
            throw new Error("後端尚未部署 LINE 推播函式 (Cloud Function: sendLineReport)。");
        }
        if (error.code === 'permission-denied') {
            throw new Error("權限不足，無法執行推播。");
        }
        throw new Error(`推播失敗: ${error.message}`);
    }
};
