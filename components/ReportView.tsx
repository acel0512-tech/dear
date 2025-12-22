
import React, { useState, useEffect } from 'react';
import { AssessmentData, AIAnalysisResult } from '../types';
import { ArrowLeft, CheckCircle2, Sun, Zap, User, Activity, Droplets, Target, Layers, Microscope, LayoutDashboard, Maximize2, X, Share2, QrCode, Download, ClipboardCheck, PenTool, Sparkles, ShoppingBag, ListChecks, Stethoscope, Briefcase, ChevronRight } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

interface ReportViewProps {
  data: AssessmentData;
  reportContent: string;
  aiAnalysis?: AIAnalysisResult; 
  onBack: () => void;
}

const ScalpRadarChart: React.FC<{ analysis: AIAnalysisResult }> = ({ analysis }) => {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const size = 200;
  const center = size / 2;
  const radius = 65; 
  const axes = [
    { label: '顏色', value: analysis.color.score },
    { label: '毛孔', value: analysis.pores.score },
    { label: '密度', value: analysis.density.score },
    { label: '粗細', value: analysis.diameter.score },
    { label: '皮脂', value: analysis.sebum.score },
  ];

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 100) * radius * scale;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const dataPath = axes.map((axis, i) => {
    const coords = getCoordinates(axis.value, i);
    return `${i === 0 ? 'M' : 'L'} ${coords.x},${coords.y}`;
  }).join(' ') + ' Z';

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
       <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[20, 40, 60, 80, 100].map((level, j) => (
             <path
               key={j}
               d={Array.from({length: 5}).map((_, i) => {
                 const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                 const r = (level / 100) * radius;
                 return `${i === 0 ? 'M' : 'L'} ${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
               }).join(' ') + ' Z'}
               fill="none"
               stroke="#e7e5e4"
               strokeWidth="1"
             />
          ))}
          <path d={dataPath} fill="rgba(194, 65, 12, 0.2)" stroke="#c2410c" strokeWidth="2" className="transition-all duration-1000 ease-out" />
          {axes.map((axis, i) => {
             const labelPos = { 
                x: center + (radius + 20) * Math.cos((Math.PI * 2 * i) / 5 - Math.PI / 2),
                y: center + (radius + 20) * Math.sin((Math.PI * 2 * i) / 5 - Math.PI / 2)
             };
             return (
               <text key={i} x={labelPos.x} y={labelPos.y} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78716c">{axis.label}</text>
             );
          })}
       </svg>
    </div>
  );
};

const MetricBadge = ({ icon: Icon, label, score, status }: any) => {
    const isGood = score >= 80;
    const isWarn = score < 60;
    const colorClass = isGood ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : isWarn ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-amber-700 bg-amber-50 border-amber-100';

    return (
        <div className={`flex items-center gap-2 p-2 rounded-xl border ${colorClass}`}>
            <Icon className="w-4 h-4" />
            <div className="flex-1">
                <div className="text-[9px] font-bold uppercase tracking-tighter opacity-70 leading-none mb-1">{label}</div>
                <div className="text-xs font-black">{status}</div>
            </div>
            <div className="text-sm font-mono font-black">{score}</div>
        </div>
    );
};

const ReportView: React.FC<ReportViewProps> = ({ data, reportContent, aiAnalysis, onBack }) => {
  const [previewImage, setPreviewImage] = useState<{ src: string, title: string } | null>(null);

  const formatText = (text: string) => {
    const lines = text.split('\n');
    let currentSection = '';

    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-2"></div>;

      // 標題優化
      if (trimmed.startsWith('### ') || trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const title = trimmed.replace(/[#\*]/g, '').trim();
        currentSection = title;
        
        let icon = <ClipboardCheck className="w-5 h-5" />;
        let colorTheme = "text-stone-800 bg-stone-100 border-stone-200";

        if (title.includes('診斷')) { icon = <Stethoscope className="w-5 h-5" />; colorTheme = "text-orange-900 bg-orange-50 border-orange-200"; }
        if (title.includes('居家')) { icon = <ShoppingBag className="w-5 h-5" />; colorTheme = "text-amber-900 bg-amber-50 border-amber-200"; }
        if (title.includes('日常')) { icon = <ListChecks className="w-5 h-5" />; colorTheme = "text-stone-700 bg-stone-50 border-stone-200"; }
        if (title.includes('課程')) { icon = <Briefcase className="w-5 h-5" />; colorTheme = "text-emerald-900 bg-emerald-50 border-emerald-200"; }

        return (
          <div key={index} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border mb-4 mt-8 break-inside-avoid ${colorTheme}`}>
             {icon}
             <h3 className="font-black text-base tracking-tight">{title}</h3>
          </div>
        );
      }

      // 列表優化
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^[\-\*\d\.]\s*/, '');
        const isBold = content.includes('**');
        
        return (
          <div key={index} className="flex gap-3 mb-3 ml-2 group break-inside-avoid">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-700 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
             <p className="text-sm text-stone-700 leading-relaxed">
               {isBold ? (
                 <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<b class="text-orange-900 font-black">$1</b>') }} />
               ) : content}
             </p>
          </div>
        );
      }

      return <p key={index} className="text-sm text-stone-600 leading-relaxed mb-4 pl-6 text-justify">{trimmed}</p>;
    });
  };

  const beforeImgs = data.observation.images;
  const afterImgs = data.observationAfter?.images;

  return (
    <div className="w-full flex flex-col items-center bg-stone-100 py-6 md:py-10">
      <div className="fixed top-6 left-6 z-50 no-print flex flex-col gap-3">
         <button onClick={onBack} className="p-3 bg-white hover:bg-stone-50 text-stone-600 rounded-full shadow-lg border border-stone-200 transition-all active:scale-95"><ArrowLeft className="w-5 h-5" /></button>
         <button onClick={() => window.print()} className="p-3 bg-orange-800 text-white rounded-full shadow-lg hover:bg-orange-900 transition-all active:scale-95"><Download className="w-5 h-5" /></button>
      </div>

      <div className="printable-container bg-white p-8 md:p-14 max-w-[210mm] w-full mx-auto shadow-2xl min-h-[297mm] rounded-none border border-stone-200 relative overflow-hidden">
        {/* 精品背景浮水印 */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <CheckCircle2 className="w-96 h-96 -rotate-12" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-orange-900 pb-6 mb-8 relative z-10">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 bg-orange-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><CheckCircle2 className="w-10 h-10" /></div>
             <div>
                <h1 className="text-3xl font-black text-stone-800 tracking-tighter">訫肌 頭皮管理中心</h1>
                <p className="text-orange-900 text-[11px] font-black tracking-[0.4em] uppercase mt-1">Boutique Scalp Therapy Report</p>
             </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="px-3 py-1 bg-orange-50 text-orange-900 text-[10px] font-black rounded-md mb-2">VIP 精密檢測</div>
             <div className="text-xl font-black text-stone-800">{data.basic.name} <span className="text-xs font-normal text-stone-500">貴賓</span></div>
             <div className="text-[10px] text-stone-400 font-mono mt-1">ID: {data.basic.phone.slice(-4)} | {new Date().toLocaleDateString('zh-TW')}</div>
          </div>
        </div>

        {/* Dashboard Section */}
        {aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 break-inside-avoid relative z-10">
                {/* Scalp Age Meter */}
                <div className="md:col-span-4 bg-gradient-to-br from-orange-900 to-stone-900 rounded-[2rem] p-6 text-white flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                    <Sparkles className="absolute -top-2 -right-2 w-16 h-16 text-white/5 rotate-12" />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60 mb-3">Predicted Scalp Age</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black italic tracking-tighter">{aiAnalysis.estimatedAge}</span>
                        <span className="text-xl font-bold opacity-40">歲</span>
                    </div>
                    <div className="mt-5 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-orange-400" style={{ width: `${Math.max(20, 100 - (aiAnalysis.estimatedAge - 20) * 2)}%` }}></div>
                    </div>
                    <p className="mt-3 text-[10px] font-bold tracking-widest text-orange-200">
                        {aiAnalysis.estimatedAge <= 30 ? '極致健康狀態' : '建議啟動深層修復'}
                    </p>
                </div>

                {/* Radar & Metrics */}
                <div className="md:col-span-8 bg-stone-50/80 backdrop-blur-sm p-5 rounded-[2rem] border border-stone-100 flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 scale-90 sm:scale-100"><ScalpRadarChart analysis={aiAnalysis} /></div>
                    <div className="flex-1 w-full grid grid-cols-2 gap-2.5">
                        <MetricBadge icon={Droplets} label="基底色" score={aiAnalysis.color.score} status={aiAnalysis.color.status} />
                        <MetricBadge icon={Target} label="淨化度" score={aiAnalysis.pores.score} status={aiAnalysis.pores.status} />
                        <MetricBadge icon={Layers} label="豐盈度" score={aiAnalysis.density.score} status={aiAnalysis.density.status} />
                        <MetricBadge icon={Microscope} label="平衡度" score={aiAnalysis.sebum.score} status={aiAnalysis.sebum.status} />
                    </div>
                </div>
            </div>
        )}

        {/* Image Grid */}
        <div className="mb-12 break-inside-avoid relative z-10">
            <h2 className="text-xs font-black text-stone-400 mb-5 flex items-center gap-3 uppercase tracking-[0.2em]">
               <div className="h-[1px] flex-1 bg-stone-200"></div>
               Optical Sensory Imaging
               <div className="h-[1px] flex-1 bg-stone-200"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {['whiteLight', 'polarizedLight', 'custom'].map((key) => {
                  const labels = { whiteLight: '頭頂區 (白光)', polarizedLight: '顳區 (偏光)', custom: '重點部位' };
                  const b = beforeImgs[key as keyof typeof beforeImgs];
                  const a = afterImgs ? afterImgs[key as keyof typeof afterImgs] : null;

                  return (
                    <div key={key} className="flex flex-col gap-2.5">
                       <div className="relative rounded-[1.5rem] overflow-hidden shadow-sm border border-stone-100 aspect-[4/3] bg-stone-100 group">
                          {a && b ? (
                             <BeforeAfterSlider beforeImg={b} afterImg={a} label={labels[key as keyof typeof labels]} />
                          ) : (
                             b ? <img src={b} className="w-full h-full object-cover" alt="S" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-300 italic">待擷取</div>
                          )}
                       </div>
                       <div className="text-[10px] text-center text-stone-500 font-black uppercase tracking-widest">{labels[key as keyof typeof labels]}</div>
                    </div>
                  );
                })}
            </div>
        </div>

        {/* Structured Report Content */}
        <div className="relative z-10 pb-20">
            {formatText(reportContent)}
        </div>

        {/* Footer & Signature */}
        <div className="mt-auto border-t border-stone-100 pt-10 flex justify-between items-center break-inside-avoid relative z-10">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-stone-50 rounded-2xl border border-stone-200 p-2"><QrCode className="w-full h-full text-stone-300" /></div>
                <div className="text-[9px] text-stone-400 space-y-1">
                    <p className="font-black uppercase tracking-widest text-orange-900 mb-1">Authenticated Certificate</p>
                    <p>由 訫肌 AI 高階光譜分析系統 生成</p>
                    <p>SERIAL: SC-AI-{new Date().getTime().toString().slice(-8)}</p>
                    <p className="italic opacity-60">此報告僅供美容保養建議，不具備醫療診斷或處置效力。</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-stone-400 font-black mb-5 uppercase tracking-[0.2em]">Authorized Signature</p>
                <div className="font-serif italic text-3xl text-orange-900 border-b-2 border-orange-900 min-w-[180px] text-center pb-2 px-4">
                   訫肌 專業顧問
                </div>
            </div>
        </div>

        <div className="mt-12 pt-6 text-center text-[9px] text-stone-300 font-black tracking-[0.5em] uppercase border-t border-stone-50">
            &copy; 訫肌 SCALP MANAGEMENT | BOUTIQUE CARE SYSTEM
        </div>
      </div>
    </div>
  );
};

export default ReportView;
