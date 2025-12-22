
import React, { useState } from 'react';
import { CustomerProfile, ScalpReportRecord, CustomerBasicInfo, LifestyleInfo } from '../types';
import { Clock, PlusCircle, User, ChevronRight, Calendar, Edit2, Save, X, Activity, UserCog, CheckSquare, BarChart2, Camera, ArrowRight, Loader2, BookOpen, HardDrive, Cloud } from 'lucide-react';
import { AGE_RANGES, WASH_FREQUENCIES, OIL_ONSET_TIMES } from '../constants';
import { isFirebaseConfigured } from '../firebaseConfig';

interface CustomerDashboardProps {
  customer: CustomerProfile;
  onStartAssessment: () => void;
  onViewReport: (report: ScalpReportRecord) => void;
  onBack: () => void;
  onUpdateCustomer: (updatedCustomer: CustomerProfile) => Promise<void>;
  onCompareHistory: (records: ScalpReportRecord[]) => void;
  onContinueAssessment: (record: ScalpReportRecord) => void; 
  onOpenKnowledgeBase: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  customer, 
  onStartAssessment, 
  onViewReport, 
  onBack, 
  onUpdateCustomer, 
  onCompareHistory,
  onContinueAssessment,
  onOpenKnowledgeBase
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editBasic, setEditBasic] = useState<CustomerBasicInfo>(customer.basic);
  const [editLifestyle, setEditLifestyle] = useState<LifestyleInfo>(customer.lifestyle);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedCustomer = {
      ...customer,
      basic: editBasic,
      lifestyle: editLifestyle
    };
    await onUpdateCustomer(updatedCustomer);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditBasic(customer.basic);
    setEditLifestyle(customer.lifestyle);
    setIsEditing(false);
  };

  const toggleRecordSelection = (id: string) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter(rid => rid !== id));
    } else {
      if (selectedRecords.length >= 5) {
        alert("最多只能選取 5 筆紀錄進行比對");
        return;
      }
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  const handleStartComparison = () => {
    if (selectedRecords.length < 2) {
      alert("請至少選擇 2 筆紀錄進行比對");
      return;
    }
    const recordsToCompare = customer.history.filter(r => selectedRecords.includes(r.id));
    onCompareHistory(recordsToCompare);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 printable-container">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Storage Indicator Background Decor */}
        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <HardDrive className="w-32 h-32 rotate-12" />
        </div>

        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto relative z-10">
          <div className="bg-stone-100 p-3 md:p-4 rounded-full flex-shrink-0">
            <User className="w-6 h-6 md:w-8 md:h-8 text-stone-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-stone-800">{customer.basic.name}</h1>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400 text-sm">{customer.id}</span>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100">
                        <HardDrive className="w-2.5 h-2.5" />
                        設備儲存中
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-stone-500 mt-1">
              <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">{customer.basic.gender}</span>
              <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">{customer.basic.ageRange} 歲</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto no-print relative z-10">
          <button onClick={onOpenKnowledgeBase} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 font-medium transition-colors text-sm md:text-base whitespace-nowrap"><BookOpen className="w-4 h-4" /> 衛教庫</button>
          <button onClick={onBack} className="flex-1 md:flex-none px-3 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 font-medium transition-colors text-sm md:text-base whitespace-nowrap">換人</button>
          <button onClick={onStartAssessment} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-4 md:px-6 py-2 rounded-lg shadow-md font-bold transition-all text-sm md:text-base whitespace-nowrap"><PlusCircle className="w-4 h-4 md:w-5 md:h-5" /> 開始檢測</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Profile */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-bold text-stone-800 flex items-center gap-2 text-sm md:text-base">
                <UserCog className="w-4 h-4 md:w-5 md:h-5 text-orange-700" /> 顧客檔案
              </h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-orange-700 hover:text-orange-800 text-xs md:text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-orange-50 no-print"><Edit2 className="w-3 h-3" /> 編輯</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={isSaving} className="text-stone-500 p-1.5 rounded hover:bg-stone-100"><X className="w-4 h-4" /></button>
                  <button onClick={handleSave} disabled={isSaving} className="text-orange-700 p-1.5 rounded hover:bg-orange-50">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}</button>
                </div>
              )}
            </div>
            
            <div className="p-4 md:p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase mb-3">基本資料</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-stone-600 mb-1">姓名</label>
                  {isEditing ? <input type="text" value={editBasic.name} onChange={e => setEditBasic({...editBasic, name: e.target.value})} className="w-full text-sm border-stone-300 rounded-md p-1" /> : <div className="font-medium text-stone-800">{customer.basic.name}</div>}</div>
                  <div><label className="block text-xs font-bold text-stone-600 mb-1">年齡區間</label>
                  {isEditing ? <select value={editBasic.ageRange} onChange={e => setEditBasic({...editBasic, ageRange: e.target.value})} className="w-full text-sm border-stone-300 rounded-md p-1">{AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}</select> : <div className="font-medium text-stone-800">{customer.basic.ageRange}</div>}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase mb-3 flex items-center gap-2"><Activity className="w-3 h-3" /> 生活習慣</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-xs font-bold text-stone-600 mb-1">洗頭頻率</label>
                     {isEditing ? <select value={editLifestyle.washFrequency} onChange={e => setEditLifestyle({...editLifestyle, washFrequency: e.target.value})} className="w-full text-sm border-stone-300 rounded-md p-1">{WASH_FREQUENCIES.map(o => <option key={o} value={o}>{o}</option>)}</select> : <div className="text-sm font-medium text-stone-800">{customer.lifestyle.washFrequency}</div>}</div>
                     <div><label className="block text-xs font-bold text-stone-600 mb-1">出油時間</label>
                     {isEditing ? <select value={editLifestyle.oilOnsetTime} onChange={e => setEditLifestyle({...editLifestyle, oilOnsetTime: e.target.value})} className="w-full text-sm border-stone-300 rounded-md p-1">{OIL_ONSET_TIMES.map(o => <option key={o} value={o}>{o}</option>)}</select> : <div className="text-sm font-medium text-stone-800">{customer.lifestyle.oilOnsetTime}</div>}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><HardDrive className="w-4 h-4" /></div>
                <div>
                    <p className="text-[10px] font-bold text-stone-500 uppercase leading-none mb-1">Local Data Status</p>
                    <p className="text-xs font-bold text-stone-700">檢測影像儲存於平板內部 ({customer.history.length} 筆)</p>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline History */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-stone-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-700" /> 檢測歷程
            </h3>
            {customer.history.length > 0 && (
              !selectionMode ? (
                <button onClick={() => setSelectionMode(true)} className="w-full sm:w-auto text-sm flex items-center justify-center gap-1 text-stone-600 hover:text-orange-700 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 no-print"><CheckSquare className="w-4 h-4" /> 選取比對</button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => { setSelectionMode(false); setSelectedRecords([]); }} className="flex-1 sm:flex-none text-sm text-stone-500 px-3 py-2 bg-stone-100 rounded-lg">取消</button>
                  <button onClick={handleStartComparison} className="flex-1 sm:flex-none text-sm flex items-center justify-center gap-1 bg-orange-700 text-white px-3 py-2 rounded-lg hover:bg-orange-800 shadow-sm"><BarChart2 className="w-4 h-4" /> 比對 ({selectedRecords.length})</button>
                </div>
              )
            )}
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {customer.history.length === 0 ? (
               <div className="text-center py-16 bg-stone-50/50 rounded-xl border border-dashed border-stone-200 flex flex-col items-center justify-center">
                  <Clock className="w-12 h-12 text-stone-200 mb-4" />
                  <p className="text-stone-500 font-medium">目前尚無檢測紀錄</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.history.map((record) => (
                    <div key={record.id} className="relative group">
                      {selectionMode && <div className="absolute top-2 left-2 z-20"><input type="checkbox" checked={selectedRecords.includes(record.id)} onChange={() => toggleRecordSelection(record.id)} className="w-5 h-5 text-orange-600 rounded" /></div>}
                      <div onClick={() => !selectionMode && onViewReport(record)} className={`bg-white border rounded-xl p-4 transition-all flex flex-col h-full ${selectionMode ? (selectedRecords.includes(record.id) ? 'border-orange-500 bg-orange-50/30' : 'border-stone-200') : 'border-stone-200 hover:shadow-md hover:border-orange-400 cursor-pointer'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 text-stone-600 font-bold text-[10px]"><Calendar className="w-3 h-3 text-orange-500" />{formatDate(record.date)}</div>
                          {!selectionMode && <ChevronRight className="w-4 h-4 text-stone-300 no-print" />}
                        </div>
                        <div className="flex gap-2 mb-2">
                           <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">{record.data.observation.location}</span>
                           {record.data.observationAfter && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">已護理</span>}
                        </div>
                        <div className="text-stone-600 text-[10px] bg-stone-50 p-2 rounded-lg border border-stone-100 flex-1 line-clamp-2 italic">
                           {record.reportContent.split('\n')[0].replace(/#/g, '')}
                        </div>
                        {!selectionMode && !record.data.observationAfter && (
                           <button onClick={(e) => { e.stopPropagation(); onContinueAssessment(record); }} className="mt-3 w-full flex items-center justify-center gap-1 bg-orange-50 text-orange-700 py-1.5 rounded-lg font-bold text-[10px] hover:bg-orange-100 no-print"><Camera className="w-3 h-3" /> 補拍護理後</button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
