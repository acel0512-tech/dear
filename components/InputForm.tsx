
import React, { useState, useEffect, useRef } from 'react';
import { ScalpObservation, ScalpImages } from '../types';
import { 
  ChevronRight, Microscope, Trash2, Sun, Zap, User, Lock, 
  Sparkles, X, ClipboardList, Download, Check, Mic, MicOff, Tag, MessageSquare, Maximize2, Loader2 
} from 'lucide-react';
import ScalpCamera from './ScalpCamera';
import { saveImageToSystemAlbum } from '../services/deviceService';

interface InputFormProps {
  onSubmit: (observationBefore: ScalpObservation, observationAfter?: ScalpObservation, consultantNotes?: string) => void;
  isLoading: boolean;
  initialBeforeObservation?: ScalpObservation | null;
}

const QUICK_TAGS = {
  "顧客自覺": ["頭皮癢感", "緊繃不適", "悶厚油膩", "換季乾敏", "偶爾刺痛"],
  "生活狀態": ["近期壓力大", "睡眠不足", "剛進行染燙", "洗頭水溫偏高", "戶外活動多"],
  "專業加註": ["異常落髮跡象", "角質栓塞嚴重", "毛囊紅腫風險", "髮徑明顯變細"]
};

const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-2">
    <Icon className="w-5 h-5 text-orange-700" />
    <h2 className="text-lg font-bold text-stone-800">{title}</h2>
  </div>
);

const Label = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-sm font-bold text-stone-700 mb-1.5">{children}</label>
);

const RadioGroup = ({ value, onChange, options, disabled = false }: { value: string, onChange: (val: string) => void, options: string[], disabled?: boolean }) => (
  <div className="flex gap-2 flex-wrap">
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        disabled={disabled}
        onClick={() => onChange(opt)}
        className={`px-3 md:px-4 py-2 text-sm rounded-lg border transition-all font-medium ${
          value === opt
            ? 'bg-orange-700 text-white border-orange-700 shadow-md'
            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// Fix: Completed the component implementation and added default export to resolve App.tsx import error.
const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, initialBeforeObservation }) => {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');
  const [previewImage, setPreviewImage] = useState<{ src: string, title: string } | null>(null);
  const [consultantNotes, setConsultantNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [showManualNote, setShowManualNote] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [beforeObs, setBeforeObs] = useState<ScalpObservation>({ 
    location: '全頭綜合檢測', color: '正常', oilLevel: '中', poreStatus: '清晰',
    images: { whiteLight: null, polarizedLight: null, custom: null }
  });

  const [afterObs, setAfterObs] = useState<ScalpObservation>({ 
    location: '全頭綜合檢測', color: '正常', oilLevel: '低', poreStatus: '清晰',
    images: { whiteLight: null, polarizedLight: null, custom: null }
  });

  const [hasAfterImages, setHasAfterImages] = useState(false);

  useEffect(() => {
    if (initialBeforeObservation) {
      setBeforeObs(initialBeforeObservation);
      setActiveTab('after');
    }
    
    // Cleanup recognition on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore close errors
        }
      }
    };
  }, [initialBeforeObservation]);

  const handleCameraCapture = (type: keyof ScalpImages, imageSrc: string) => {
    if (activeTab === 'before') {
      setBeforeObs(prev => ({ ...prev, images: { ...prev.images, [type]: imageSrc } }));
    } else {
      setAfterObs(prev => ({ ...prev, images: { ...prev.images, [type]: imageSrc } }));
      setHasAfterImages(true);
    }
  };

  const handleRemoveImage = (type: keyof ScalpImages) => {
    if (activeTab === 'before') {
      setBeforeObs(prev => ({ ...prev, images: { ...prev.images, [type]: null } }));
    } else {
      setAfterObs(prev => ({ ...prev, images: { ...prev.images, [type]: null } }));
    }
  };

  const handleSaveToAlbum = async (e: React.MouseEvent, type: keyof ScalpImages, src: string) => {
    e.stopPropagation();
    const id = `${activeTab}_${type}`;
    const ok = await saveImageToSystemAlbum(src, `scalp_${id}_${Date.now()}.jpg`);
    if (ok) {
      setSavedStatus(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSavedStatus(prev => ({ ...prev, [id]: false })), 3000);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("抱歉，您的設備或瀏覽器不支援語音辨識功能。建議使用 Chrome 或 Safari 瀏覽器並確保麥克風已授權。");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    // 立即提供視覺回饋
    setIsListening(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-TW';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log('Voice recognition started');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setConsultantNotes(prev => prev + (prev ? '，' : '') + text);
          setShowManualNote(true);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert("請授權麥克風存取權限以使用語音筆記功能。");
        } else if (event.error === 'no-speech') {
          // Just reset without alert if no speech detected
        } else {
          alert(`語音辨識發生錯誤: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAfter = hasAfterImages ? afterObs : undefined;
    const finalNotes = [
      selectedTags.length > 0 ? `標籤觀察：${selectedTags.join('、')}` : '',
      consultantNotes.trim()
    ].filter(Boolean).join('；');
    
    onSubmit(beforeObs, finalAfter, finalNotes);
  };

  const steps = [
    { key: 'whiteLight', label: '1. 頭頂區 (白光)', subLabel: '整體狀態', icon: Sun, color: 'text-amber-700 bg-amber-100' },
    { key: 'polarizedLight', label: '2. 顳區 (偏光)', subLabel: '深層阻塞', icon: Zap, color: 'text-orange-700 bg-orange-100' },
    { key: 'custom', label: '3. 重點部位', subLabel: '加強檢測', icon: User, color: 'text-stone-600 bg-stone-200' }
  ];

  const currentObs = activeTab === 'before' ? beforeObs : afterObs;
  const isBeforeLocked = !!initialBeforeObservation && activeTab === 'before';

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-3">
         <Microscope className="w-5 h-5 text-orange-700" />
         <div>
            <h3 className="font-bold text-stone-800 text-sm">檢測模式：全頭多實譜綜合分析</h3>
            <p className="text-xs text-stone-500">系統將結合白光與偏光影像進行精準診斷</p>
         </div>
      </div>

      <div className="flex rounded-xl bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('before')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'before' ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> 護理前檢測
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('after')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'after' ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Check className="w-4 h-4" /> 護理後比對
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <SectionTitle icon={Microscope} title={activeTab === 'before' ? "第一階段：護理前影像擷取" : "第二階段：護理後成效驗證"} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {steps.map((step) => {
            const img = currentObs.images[step.key as keyof ScalpImages];
            const isSaved = savedStatus[`${activeTab}_${step.key}`];

            return (
              <div key={step.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-800">{step.label}</span>
                    <span className="text-xs text-stone-500">{step.subLabel}</span>
                  </div>
                </div>

                <div className="aspect-[4/3] relative group">
                  {img ? (
                    <>
                      <img src={img} alt={step.label} className="w-full h-full object-cover rounded-2xl border border-stone-200" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ src: img, title: step.label })}
                          className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSaveToAlbum(e, step.key as keyof ScalpImages, img)}
                          className={`p-2 rounded-full backdrop-blur-md transition-all ${
                            isSaved ? 'bg-emerald-500 text-white' : 'bg-white/20 hover:bg-white/40 text-white'
                          }`}
                        >
                          {isSaved ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                        </button>
                        {!isBeforeLocked && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(step.key as keyof ScalpImages)}
                            className="p-2 bg-rose-500/80 hover:bg-rose-600 rounded-full text-white backdrop-blur-md"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full">
                      <ScalpCamera 
                        onCapture={(src) => handleCameraCapture(step.key as keyof ScalpImages, src)} 
                        modeLabel={step.label}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6 pt-6 border-t border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>頭皮色澤</Label>
              <RadioGroup 
                value={currentObs.color} 
                onChange={(val) => activeTab === 'before' ? setBeforeObs({...beforeObs, color: val as any}) : setAfterObs({...afterObs, color: val as any})}
                options={['正常', '偏紅']}
                disabled={isBeforeLocked}
              />
            </div>
            <div className="space-y-4">
              <Label>油脂分泌量</Label>
              <RadioGroup 
                value={currentObs.oilLevel} 
                onChange={(val) => activeTab === 'before' ? setBeforeObs({...beforeObs, oilLevel: val as any}) : setAfterObs({...afterObs, oilLevel: val as any})}
                options={['低', '中', '高']}
                disabled={isBeforeLocked}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <SectionTitle icon={MessageSquare} title="顧問專業紀錄" />
        
        <div className="space-y-4">
          <Label>快速特徵標記</Label>
          <div className="space-y-4">
            {Object.entries(QUICK_TAGS).map(([category, tags]) => (
              <div key={category} className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-stone-50 text-stone-500 border-stone-100 hover:border-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>補充說明筆記</Label>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                isListening 
                ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200' 
                : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
              }`}
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              {isListening ? '正在聆聽...' : '語音筆記'}
            </button>
          </div>
          
          <textarea
            value={consultantNotes}
            onChange={(e) => setConsultantNotes(e.target.value)}
            onFocus={() => setShowManualNote(true)}
            placeholder="請輸入更多觀察細節，或使用上方語音輸入..."
            className="w-full h-32 rounded-xl border-stone-200 focus:border-orange-500 focus:ring-orange-500 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-center pt-4 pb-12">
        <button
          type="submit"
          disabled={isLoading || (!beforeObs.images.whiteLight && !beforeObs.images.polarizedLight)}
          className="group relative flex items-center justify-center gap-3 bg-stone-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-orange-400" />}
          {isLoading ? '報告精算中...' : '產出專業分析報告'}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>

    {previewImage && (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
        <button className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
        <div className="max-w-4xl w-full flex flex-col items-center">
          <img src={previewImage.src} alt="Preview" className="max-h-[80vh] rounded-2xl shadow-2xl border border-white/10" />
          <h4 className="mt-4 text-white font-bold text-lg">{previewImage.title}</h4>
        </div>
      </div>
    )}
    </>
  );
};

export default InputForm;
