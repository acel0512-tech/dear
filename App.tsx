
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ReportView from './components/ReportView';
import CustomerLookup from './components/CustomerLookup';
import CustomerDashboard from './components/CustomerDashboard';
import HistoryComparisonView from './components/HistoryComparisonView'; 
import KnowledgeBase from './components/KnowledgeBase';
import { AssessmentData, AppStatus, CustomerProfile, ScalpReportRecord, ScalpObservation, AIAnalysisResult } from './types';
import { generateReport } from './services/geminiService';
import { analyzeImagesWithMachineLearning } from './services/imageProcessingService';
import { addReportToCustomer, findCustomerByPhone, saveCustomer, updateCustomerReport } from './services/storageService';
import { AlertCircle, Cpu, Binary, Search, Database, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOOKUP);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null);
  const [currentReportData, setCurrentReportData] = useState<AssessmentData | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | undefined>(undefined);
  const [compareRecords, setCompareRecords] = useState<ScalpReportRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    { label: "影像特徵擷取中...", icon: Search },
    { label: "光譜數據對比中...", icon: Cpu },
    { label: "匹配專家建議系統...", icon: Database },
    { label: "AI 顧問產出報告中...", icon: Sparkles }
  ];

  useEffect(() => {
    let interval: any;
    if (status === AppStatus.PROCESSING || status === AppStatus.GENERATING) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % steps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleCustomerSelect = (customer: CustomerProfile) => {
    setCurrentCustomer(customer);
    setStatus(AppStatus.DASHBOARD);
  };

  const handleUpdateCustomer = async (updatedCustomer: CustomerProfile) => {
    try {
      await saveCustomer(updatedCustomer);
      setCurrentCustomer(updatedCustomer);
    } catch (e) {
      alert("更新失敗");
    }
  };

  const handleStartAssessment = () => setStatus(AppStatus.ASSESSMENT);

  const handleFormSubmit = async (observationBefore: ScalpObservation, observationAfter?: ScalpObservation, consultantNotes?: string) => {
    if (!currentCustomer) return;
    setStatus(AppStatus.PROCESSING);
    try {
      const machineMetrics = await analyzeImagesWithMachineLearning(observationBefore.images);
      const fullData: AssessmentData = {
        basic: currentCustomer.basic,
        lifestyle: currentCustomer.lifestyle,
        observation: observationBefore,
        observationAfter: observationAfter,
        machineMetrics: machineMetrics || undefined,
        consultantNotes: consultantNotes
      };
      setCurrentReportData(fullData);
      setStatus(AppStatus.GENERATING);

      const { report, analysis } = await generateReport(fullData);
      setReportContent(report);
      setAiAnalysis(analysis);
      
      const newRecord: ScalpReportRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timestamp: Date.now(),
        data: fullData,
        reportContent: report,
        aiAnalysis: analysis
      };
      await addReportToCustomer(currentCustomer.id, newRecord);
      const updated = await findCustomerByPhone(currentCustomer.id);
      if (updated) setCurrentCustomer(updated);
      setStatus(AppStatus.COMPLETE);
    } catch (error: any) {
      setStatus(AppStatus.ERROR);
      setErrorMsg('分析超時，請檢查連線品質。');
    }
  };

  const LoadingScreen = () => {
    const CurrentIcon = steps[loadingStep].icon;
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 bg-white rounded-[40px] shadow-2xl border border-stone-100">
        <div className="relative mb-12">
            <div className="absolute inset-0 bg-orange-200 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-orange-600 to-stone-900 rounded-3xl flex items-center justify-center shadow-xl">
                <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
            </div>
        </div>
        <h3 className="text-2xl font-black text-stone-800 tracking-tighter mb-2">{steps[loadingStep].label}</h3>
        <p className="text-stone-400 text-sm font-medium tracking-widest uppercase">M-13 Precise Analysis Active</p>
        <div className="mt-10 flex gap-1.5">
           {steps.map((_, i) => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === loadingStep ? 'w-8 bg-orange-700' : 'w-2 bg-stone-200'}`}></div>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1 w-full max-w-7xl">
        {status === AppStatus.LOOKUP && <CustomerLookup onCustomerSelect={handleCustomerSelect} />}
        
        {status === AppStatus.DASHBOARD && currentCustomer && (
          <CustomerDashboard 
            customer={currentCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onStartAssessment={handleStartAssessment}
            onViewReport={(r) => { 
              setCurrentReportData(r.data); 
              setReportContent(r.reportContent); 
              setAiAnalysis(r.aiAnalysis); 
              setStatus(AppStatus.COMPLETE); 
            }}
            onBack={() => { setStatus(AppStatus.LOOKUP); setCurrentCustomer(null); }}
            onCompareHistory={(recs) => {
              setCompareRecords(recs);
              setStatus(AppStatus.HISTORY_COMPARE);
            }}
            onContinueAssessment={(r) => setStatus(AppStatus.ASSESSMENT)}
            onOpenKnowledgeBase={() => setStatus(AppStatus.KNOWLEDGE_BASE)}
          />
        )}

        {status === AppStatus.KNOWLEDGE_BASE && (
          <KnowledgeBase onBack={() => setStatus(AppStatus.DASHBOARD)} />
        )}

        {status === AppStatus.HISTORY_COMPARE && currentCustomer && (
          <HistoryComparisonView 
            records={compareRecords} 
            customerName={currentCustomer.basic.name} 
            onBack={() => setStatus(AppStatus.DASHBOARD)} 
          />
        )}

        {(status === AppStatus.PROCESSING || status === AppStatus.GENERATING) && <LoadingScreen />}
        
        {status === AppStatus.ASSESSMENT && currentCustomer && <InputForm onSubmit={handleFormSubmit} isLoading={false} />}
        
        {status === AppStatus.COMPLETE && currentReportData && (
          <ReportView 
            data={currentReportData} 
            reportContent={reportContent} 
            aiAnalysis={aiAnalysis} 
            onBack={() => setStatus(AppStatus.DASHBOARD)} 
          />
        )}
        
        {status === AppStatus.ERROR && (
           <div className="max-w-md mx-auto text-center py-20 bg-white rounded-3xl border border-red-100 shadow-xl">
             <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-red-800 mb-2">檢測連線異常</h3>
             <p className="text-red-600 text-sm mb-8 px-8">{errorMsg}</p>
             <button onClick={() => setStatus(AppStatus.ASSESSMENT)} className="bg-stone-900 text-white font-bold py-3 px-10 rounded-xl hover:bg-black transition-all">重新分析</button>
           </div>
        )}
      </main>
      <footer className="py-10 text-center text-stone-300 text-[10px] tracking-widest uppercase no-print">&copy; 訫肌 SCALP ANALYSIS</footer>
    </div>
  );
};

export default App;
