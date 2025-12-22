
import React, { useState } from 'react';
import { ScalpReportRecord } from '../types';
import { ArrowLeft, Calendar, ArrowRight, ArrowDown, Maximize2, X } from 'lucide-react';

interface HistoryComparisonViewProps {
  records: ScalpReportRecord[];
  onBack: () => void;
  customerName: string;
}

const HistoryComparisonView: React.FC<HistoryComparisonViewProps> = ({ records, onBack, customerName }) => {
  const [previewImage, setPreviewImage] = useState<{ src: string, title: string } | null>(null);

  // Sort records by date ascending
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });

  return (
    <>
    <div className="max-w-6xl mx-auto printable-container">
      {/* Control Bar */}
      <div className="no-print mb-6 sticky top-4 z-40">
        <button 
            onClick={onBack} 
            className="flex items-center justify-center gap-2 text-slate-600 bg-white shadow-sm border border-slate-200 hover:text-emerald-700 font-medium px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
      </div>

      <div id="printable-report" className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-[500px]">
        <div className="border-b-2 border-emerald-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-emerald-900 tracking-wider">頭皮護理歷程紀錄</h1>
             <p className="text-emerald-700 mt-2 font-medium text-sm md:text-base">HISTORICAL CARE PROGRESS</p>
           </div>
           <div className="text-left md:text-right w-full md:w-auto">
             <div className="text-lg font-bold text-slate-800">{customerName} 貴賓</div>
             <div className="text-sm text-slate-500 mt-1">紀錄區間：{formatDate(sortedRecords[0].date)} - {formatDate(sortedRecords[sortedRecords.length-1].date)}</div>
           </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
           {/* Desktop Horizontal Connecting Line (visual only) */}
           <div className="absolute top-[320px] left-0 right-0 h-1 bg-emerald-100 -z-0 hidden md:block"></div>
           
           {/* Mobile Vertical Connecting Line */}
           <div className="absolute left-[50%] top-0 bottom-0 w-1 bg-emerald-100 -translate-x-1/2 -z-0 block md:hidden"></div>

           {/* 
              Responsive Layout: 
              Mobile: Vertical flex column
              Desktop: Horizontal flex row with scroll
           */}
           <div className="flex flex-col md:flex-row gap-8 md:gap-6 overflow-x-visible md:overflow-x-auto pb-8 custom-scrollbar">
              {sortedRecords.map((record, index) => {
                 const img = record.data.observation.images.whiteLight || record.data.observation.images.polarizedLight;
                 const isLast = index === sortedRecords.length - 1;
                 
                 return (
                    <div key={record.id} className="flex-shrink-0 w-full md:w-[280px] group relative flex flex-col items-center md:items-start break-inside-avoid">
                       {/* Date Badge */}
                       <div className="bg-emerald-600 text-white font-bold py-1 px-3 rounded-full inline-flex items-center gap-2 mb-3 shadow-sm z-10 relative print:bg-emerald-600 print:text-white">
                          <Calendar className="w-3 h-3" />
                          {formatDate(record.date)}
                          <span className="text-[10px] opacity-80 font-normal">第 {index + 1} 次</span>
                       </div>

                       {/* Image Card */}
                       <div 
                         className={`w-full max-w-[320px] rounded-xl overflow-hidden border-2 shadow-sm aspect-[4/3] bg-slate-50 relative cursor-zoom-in ${isLast ? 'border-emerald-500 shadow-emerald-100 ring-2 ring-emerald-200 ring-offset-2' : 'border-slate-200'}`}
                         onClick={() => img && setPreviewImage({ src: img, title: `${formatDate(record.date)} - 檢測影像` })}
                       >
                          {img ? (
                            <>
                                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Visit ${index+1}`} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none no-print">
                                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 drop-shadow-md" />
                                </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">無影像</div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                             <p className="text-white text-xs font-medium truncate">{record.data.observation.location}</p>
                          </div>
                       </div>

                       {/* Comparison Arrow (Desktop) */}
                       {!isLast && (
                          <div className="absolute top-[50%] -right-5 transform -translate-y-1/2 z-10 hidden md:block text-emerald-300 no-print">
                             <ArrowRight className="w-6 h-6" />
                          </div>
                       )}
                       
                       {/* Comparison Arrow (Mobile) */}
                       {!isLast && (
                          <div className="my-2 block md:hidden text-emerald-300 relative z-10 bg-white rounded-full p-1 border border-emerald-100 no-print">
                             <ArrowDown className="w-6 h-6" />
                          </div>
                       )}

                       {/* Data Summary */}
                       <div className="mt-4 w-full max-w-[320px] bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">油脂:</span>
                            <span className={record.data.observation.oilLevel === '高' ? 'text-red-500 font-bold' : 'text-slate-700'}>{record.data.observation.oilLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">顏色:</span>
                            <span className={record.data.observation.color === '偏紅' ? 'text-orange-500 font-bold' : 'text-slate-700'}>{record.data.observation.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">毛孔:</span>
                            <span className="text-slate-700">{record.data.observation.poreStatus}</span>
                          </div>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>

        <div className="mt-8 p-4 md:p-6 bg-emerald-50 rounded-xl border border-emerald-100">
           <h3 className="text-emerald-800 font-bold mb-2 text-sm md:text-base">護理歷程觀察筆記</h3>
           <p className="text-emerald-700/80 text-xs md:text-sm leading-relaxed text-justify">
             從 {formatDate(sortedRecords[0].date)} 至 {formatDate(sortedRecords[sortedRecords.length-1].date)} 期間，共進行了 {sortedRecords.length} 次頭皮護理檢測。
             透過上方影像紀錄，可觀察到頭皮環境的穩定度變化。建議持續對比毛囊開口清晰度與髮根強健度的細微改變。
           </p>
        </div>
      </div>
    </div>

    {/* Lightbox Modal */}
    {previewImage && (
      <div 
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in no-print"
        onClick={() => setPreviewImage(null)}
      >
        <button 
          onClick={() => setPreviewImage(null)}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        
        <div className="max-w-7xl max-h-screen w-full flex flex-col items-center">
            <img 
              src={previewImage.src} 
              alt="Full Preview" 
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-white text-lg font-bold tracking-wide bg-black/50 px-4 py-2 rounded-full border border-white/10">
               {previewImage.title}
            </div>
        </div>
      </div>
    )}
    </>
  );
};

export default HistoryComparisonView;
