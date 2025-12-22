
import { AssessmentData, KnowledgeBaseAnalysis, DiagnosisResult, ActionRecommendation } from '../types';

/**
 * 專家規則引擎 (KB Service) 升級版
 * 新增：課程資料庫與生活建議庫，實現全方位處方。
 */

// 店家護理課程資料庫
const COURSE_DB: Record<string, { name: string, description: string, duration: string }> = {
  'COURSE_O2_PURIFY': { name: '高壓氧頭皮淨化療程', description: '利用醫學級高壓氧噴射，深層剝離毛孔固態油脂。', duration: '60 min' },
  'COURSE_LASER_GROW': { name: 'LLLT 低能量雷射活髮', description: '透過 650nm 冷紅光刺激毛囊線粒體，加速血液循環。', duration: '40 min' },
  'COURSE_CALM_SPA': { name: '寧.植萃舒緩 SPA', description: '針對敏感泛紅頭皮，使用冷壓冰鎮技術與洋甘菊精萃舒緩。', duration: '90 min' },
  'COURSE_DETOX_SCALP': { name: '漢方循環頭皮排毒', description: '結合經絡按摩與漢方精油，改善蠟黃與氧化頭皮。', duration: '75 min' }
};

// 生活建議資料庫
const LIFESTYLE_DB: Record<string, string[]> = {
  'SENSITIVE': ['洗頭水溫建議控制在 32-34 度', '洗頭後務必立即吹乾髮根', '減少攝取辛辣刺激性食物', '避免使用強力去油洗髮精'],
  'OILY': ['建議晚間 11 點前入睡減少皮脂腺活躍', '枕頭套建議每週更換一次', '減少甜食與炸物攝取', '洗頭時指腹按摩至少 3 分鐘'],
  'THINNING': ['多補充優質蛋白質（黑豆、魚類）', '每日早晚各梳頭 50 下促進循環', '建議每日睡眠至少 7 小時', '適量補充鋅、生物素(Biotin)']
};

const PRODUCT_DB: Record<string, { name: string, efficacy: string, usage: string }> = {
  'V_REVITALIZE_ESSENCE': { name: '賦活精華', efficacy: '深層滋養與活絡頭皮，促進頭髮健康生長。', usage: '每日早晚乾髮時噴灑於頭皮並按摩' },
  'V_REVITALIZE_SHAMPOO': { name: '賦活洗髮精', efficacy: '強化髮絲韌度，為細軟頭髮注入生長活力。', usage: '每次洗頭清潔兩遍，第二遍停留 3 分鐘' },
  'V_CALM_ESSENCE': { name: '寧.紓壓精華', efficacy: '鎮靜頭皮不適，減輕緊繃感與發炎反應。', usage: '頭皮感到癢或緊繃時隨時噴灑' },
  'V_CALM_SHAMPOO': { name: '寧.紓壓洗髮精', efficacy: '溫和清潔，專注於壓力型頭皮的舒緩放鬆。', usage: '水溫不宜過高，指腹輕揉' },
  'V_PURIFY_DEW': { name: '甦活髮根頭皮淨化露', efficacy: '深度淨化毛孔老廢角質與固態油脂堆積。', usage: '每週使用 1-2 次，於乾髮時進行深層清潔' },
  'V_AIRY_SHAMPOO': { name: '空氣感髮浴', efficacy: '提升髮根支撐力，創造蓬鬆豐盈視覺。', usage: '吹風時逆向吹髮根效果更佳' },
  'V_GOLD_COND': { name: '金緻柔馭護髮素', efficacy: '高效滋養髮絲。', usage: '洗髮後塗抹於髮中至髮尾，避開頭皮' }
};

const calculateMiniaturizationRate = (diameter: number): number => {
  const standard = 80;
  return diameter >= standard ? 0.05 : parseFloat(((standard - diameter) / standard).toFixed(2));
};

export const runKnowledgeBaseAnalysis = (data: AssessmentData): KnowledgeBaseAnalysis => {
  const raw = data.machineMetrics || { hairDensity: 120, hairDiameter: 80, sebumPercentage: 10, follicleHealth: 80, dandruffLevel: 1 };
  
  const normalized = {
    density: raw.hairDensity,
    miniRate: calculateMiniaturizationRate(raw.hairDiameter),
    clogRate: raw.sebumPercentage / 100,
    rednessScore: data.observation.color === '偏紅' ? 2.5 : 1.0,
  };

  const diagnoses: DiagnosisResult[] = [];
  if (normalized.rednessScore >= 1.5) {
    diagnoses.push({ id: 'SH_SENSITIVE', name: '敏感發炎', description: '頭皮底色偏紅且微血管擴張。', severity: '中度' });
  }
  if (normalized.clogRate >= 0.2 || data.observation.poreStatus === '有附著物') {
    diagnoses.push({ id: 'SH_CLOGGED', name: '油脂阻塞', description: '毛孔被固態油脂填平，缺乏漏斗狀凹槽。', severity: '中度' });
  }
  if (normalized.miniRate >= 0.2 || normalized.density < 110) {
    diagnoses.push({ id: 'HL_THINNING', name: '毛囊萎縮徵兆', description: '髮徑變細且密度低於健康基準。', severity: '中度' });
  }

  const recommendations: ActionRecommendation[] = [];
  const diagIds = diagnoses.map(d => d.id);

  // 1. 居家產品處方 (Home Care)
  let homeProducts: string[] = [];
  let homeReason = '';
  if (diagIds.includes('SH_SENSITIVE')) {
    homeProducts = ['V_CALM_SHAMPOO', 'V_CALM_ESSENCE'];
    homeReason = '首要任務為修復受損屏障，降低頭皮發炎與過敏反應。';
  } else if (diagIds.includes('HL_THINNING')) {
    homeProducts = ['V_REVITALIZE_SHAMPOO', 'V_REVITALIZE_ESSENCE'];
    homeReason = '需要注入生長因子並活絡微循環，逆轉毛囊萎縮。';
  } else if (diagIds.includes('SH_CLOGGED')) {
    homeProducts = ['V_PURIFY_DEW', 'V_AIRY_SHAMPOO'];
    homeReason = '建議進行週期性深層清潔，移除毛孔栓塞，預防毛囊炎。';
  } else {
    homeProducts = ['V_AIRY_SHAMPOO', 'V_GOLD_COND'];
    homeReason = '目前狀況良好，建議維持基礎清潔與適度滋養。';
  }
  recommendations.push({ type: 'PRODUCT', title: '【居家保養處方】', content: homeReason, productIds: homeProducts });

  // 2. 日常生活建議 (Lifestyle)
  let tips: string[] = [];
  if (diagIds.includes('SH_SENSITIVE')) tips = LIFESTYLE_DB['SENSITIVE'];
  else if (diagIds.includes('SH_CLOGGED')) tips = LIFESTYLE_DB['OILY'];
  else if (diagIds.includes('HL_THINNING')) tips = LIFESTYLE_DB['THINNING'];
  else tips = ['保持規律作息', '多喝水維持代謝'];
  
  recommendations.push({ type: 'LIFESTYLE', title: '【日常改善指引】', content: tips.join('\n') });

  // 3. 店家療程建議 (Treatment)
  let courses: string[] = [];
  if (diagIds.includes('SH_CLOGGED')) courses = ['COURSE_O2_PURIFY'];
  if (diagIds.includes('HL_THINNING')) courses = ['COURSE_LASER_GROW'];
  if (diagIds.includes('SH_SENSITIVE')) courses = ['COURSE_CALM_SPA'];
  if (courses.length === 0) courses = ['COURSE_DETOX_SCALP'];
  
  recommendations.push({ type: 'TREATMENT', title: '【專業護理規劃】', content: '建議回店進行高階護理，加速改善進度。', productIds: courses });

  return { diagnoses, recommendations, normalizedData: normalized };
};

export const formatKBForPrompt = (kb: KnowledgeBaseAnalysis): string => {
  let text = `【專家核心診斷與處方內容】\n\n`;
  kb.recommendations.forEach(r => {
    text += `### ${r.title}\n`;
    if (r.type === 'LIFESTYLE') {
        text += `- 改善策略: ${r.content}\n\n`;
    } else if (r.type === 'PRODUCT') {
        text += `- 保養邏輯: ${r.content}\n- 推薦商品:\n`;
        r.productIds?.forEach(id => {
          const p = PRODUCT_DB[id];
          if (p) text += `  * **${p.name}**: ${p.efficacy} (用法：${p.usage})\n`;
        });
        text += '\n';
    } else if (r.type === 'TREATMENT') {
        text += `- 護理策略: ${r.content}\n- 建議課程:\n`;
        r.productIds?.forEach(id => {
          const c = COURSE_DB[id];
          if (c) text += `  * **${c.name}**: ${c.description} (時長：${c.duration})\n`;
        });
        text += '\n';
    }
  });
  return text;
};
