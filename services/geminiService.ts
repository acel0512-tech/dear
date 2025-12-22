
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AIAnalysisResult, KnowledgeBaseAnalysis, ScalpImages } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";
import { runKnowledgeBaseAnalysis, formatKBForPrompt } from "./knowledgeBaseService";

const cleanBase64 = (dataUrl: string) => {
  if (!dataUrl) return '';
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : dataUrl;
};

const sanitizeAnalysisData = (raw: any): AIAnalysisResult => {
  const keys: (keyof AIAnalysisResult)[] = ['color', 'pores', 'density', 'diameter', 'sebum'];
  const result: any = {};
  keys.forEach(key => {
    const item = raw?.[key];
    result[key] = {
      score: Math.min(Math.max(Number(item?.score) || 70, 0), 100),
      status: String(item?.status || "狀態良好"),
      suggestion: String(item?.suggestion || "建議保持清潔")
    };
  });
  result.estimatedAge = Number(raw?.estimatedAge) || 30;
  return result as AIAnalysisResult;
};

const BASE_TEMPLATE = `
你現在是一位「訫肌 頭皮管理中心」的首席頭皮管理顧問，具備豐富的臨床觀察與護理規劃經驗。
請根據下方提供的【專家系統核心數據】與顧客的影像，產出一份「深度定制化」的專業報告。

### 【報告必備四大版塊】
1. **[專業診斷]**：結合影像看到的特徵（如：微血管擴張、角質栓阻塞程度），用專業且易懂的語言分析成因。
2. **[居家保養處方]**：針對問題推薦具體的產品（需包含產品名稱、功效、及顧問級的使用小撇步）。
3. **[日常習慣建議]**：列出 3-5 點生活中必須改善的細節（水溫、飲食、睡眠、洗頭手法）。
4. **[門市課程規劃]**：推薦最合適的「訫肌」專業課程，說明該課程如何從根本解決目前的問題。

### 【顧客資料】
- 姓名：{{name}} / 年齡層：{{ageRange}}
- 顧問現場觀察：{{consultantNotes}}

### 【專家系統參考數據】
{{kbResult}}
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    reportText: { type: Type.STRING, description: "完整的專業分析報告內容，包含四大版塊。" },
    analysis: {
      type: Type.OBJECT,
      properties: {
        color: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, suggestion: { type: Type.STRING } }, required: ["score", "status", "suggestion"] },
        pores: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, suggestion: { type: Type.STRING } }, required: ["score", "status", "suggestion"] },
        density: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, suggestion: { type: Type.STRING } }, required: ["score", "status", "suggestion"] },
        diameter: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, suggestion: { type: Type.STRING } }, required: ["score", "status", "suggestion"] },
        sebum: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, status: { type: Type.STRING }, suggestion: { type: Type.STRING } }, required: ["score", "status", "suggestion"] },
        estimatedAge: { type: Type.NUMBER, description: "推算的頭皮肌齡" }
      },
      required: ["color", "pores", "density", "diameter", "sebum", "estimatedAge"]
    }
  },
  required: ["reportText", "analysis"]
};

export const generateReport = async (data: AssessmentData): Promise<{ report: string, analysis?: AIAnalysisResult, kbAnalysis?: KnowledgeBaseAnalysis }> => {
  // 每次調用都創建新執行個體，避免 API Key 緩存問題
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const kbAnalysisData = runKnowledgeBaseAnalysis(data);
  const kbResultText = formatKBForPrompt(kbAnalysisData);

  const promptText = BASE_TEMPLATE
    .replace(/{{name}}/g, data.basic.name)
    .replace(/{{ageRange}}/g, data.basic.ageRange)
    .replace('{{kbResult}}', kbResultText)
    .replace('{{consultantNotes}}', data.consultantNotes || '無特殊備註');

  const parts: any[] = [{ text: promptText }];
  
  // 添加影像 Parts
  if (data.observation.images.whiteLight) {
    parts.push({ text: "白光影像 (White Light):" });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(data.observation.images.whiteLight) } });
  }
  if (data.observation.images.polarizedLight) {
    parts.push({ text: "偏光影像 (Polarized Light):" });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(data.observation.images.polarizedLight) } });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // 修正 400 錯誤：同時設定 maxOutputTokens 與 thinkingBudget
        maxOutputTokens: 20000,
        thinkingConfig: { thinkingBudget: 15000 }
      }
    });

    const rawResult = JSON.parse(response.text || '{}');
    const sanitizedAnalysis = sanitizeAnalysisData(rawResult.analysis);
    
    return { 
      report: rawResult.reportText || "報告生成異常，請重新嘗試。", 
      analysis: sanitizedAnalysis, 
      kbAnalysis: kbAnalysisData 
    };
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    throw error;
  }
};
