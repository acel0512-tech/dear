
export interface CustomerBasicInfo {
  name: string;
  phone: string;
  ageRange: string;
  gender: '男' | '女';
  hasChemicalHistory: '有' | '無';
}

export interface LifestyleInfo {
  washFrequency: string;
  oilOnsetTime: string;
  itchiness: '無' | '偶爾' | '經常';
  dandruff: '無' | '少量' | '明顯';
  hairLossPerception: '正常' | '偏多';
  stressLevel: '低' | '中' | '高';
}

export interface ScalpImages {
  whiteLight: string | null;
  polarizedLight: string | null;
  custom: string | null;
}

export interface ScalpObservation {
  location: string;
  color: '正常' | '偏紅';
  oilLevel: '低' | '中' | '高';
  poreStatus: '清晰' | '有附著物';
  images: ScalpImages;
}

export interface MachineAnalysisMetrics {
  hairDensity: number;
  hairDiameter: number;
  sebumPercentage: number;
  dandruffLevel: number;
  follicleHealth: number;
}

export interface DiagnosisResult {
  id: string;
  name: string;
  description: string;
  severity: '輕度' | '中度' | '重度';
}

export interface ActionRecommendation {
  type: 'LIFESTYLE' | 'PRODUCT' | 'TREATMENT';
  title: string;
  content: string;
  productIds?: string[];
}

export interface KnowledgeBaseAnalysis {
  diagnoses: DiagnosisResult[];
  recommendations: ActionRecommendation[];
  normalizedData: {
    density: number;
    miniRate: number;
    clogRate: number;
    rednessScore: number;
  };
}

export interface AIAnalysisMetric {
  score: number;
  status: string;
  suggestion: string;
}

export interface AIAnalysisResult {
  color: AIAnalysisMetric;
  pores: AIAnalysisMetric;
  density: AIAnalysisMetric;
  diameter: AIAnalysisMetric;
  sebum: AIAnalysisMetric;
  estimatedAge: number; // 新增：預估頭皮肌齡
}

export interface AssessmentData {
  basic: CustomerBasicInfo;
  lifestyle: LifestyleInfo;
  observation: ScalpObservation;
  observationAfter?: ScalpObservation;
  machineMetrics?: MachineAnalysisMetrics;
  kbAnalysis?: KnowledgeBaseAnalysis;
  consultantNotes?: string;
}

export interface ScalpReportRecord {
  id: string;
  date: string;
  timestamp: number;
  data: AssessmentData;
  reportContent: string;
  aiAnalysis?: AIAnalysisResult;
}

export interface CustomerProfile {
  id: string;
  basic: CustomerBasicInfo;
  lifestyle: LifestyleInfo;
  history: ScalpReportRecord[];
}

export enum AppStatus {
  LOOKUP = 'LOOKUP',
  DASHBOARD = 'DASHBOARD',
  ASSESSMENT = 'ASSESSMENT',
  PROCESSING = 'PROCESSING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  HISTORY_COMPARE = 'HISTORY_COMPARE',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  ERROR = 'ERROR'
}
