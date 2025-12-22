
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, AlertTriangle, Droplets, Sparkles, AlertCircle } from 'lucide-react';

interface KnowledgeBaseProps {
  onBack: () => void;
}

const TOPICS = [
  {
    id: 'healthy',
    title: '健康頭皮標準',
    subtitle: 'Healthy Scalp',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    description: '呈現青白色透亮感，毛孔呈現清晰漏斗狀，每毛孔約 2-3 根頭髮。',
    imgUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop', // Abstract clean texture
    characteristics: [
      '顏色：青白色、半透明',
      '毛孔：深且清晰的漏斗狀',
      '密度：一孔 2-3 根髮',
      '皮脂：僅有少量保護性油脂'
    ],
    careAdvice: '維持現狀，定期進行基礎清潔與保濕，避免過度清潔破壞屏障。'
  },
  {
    id: 'sensitive',
    title: '敏感/發炎性頭皮',
    subtitle: 'Sensitive / Inflamed',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    description: '頭皮呈現粉紅色或塊狀紅斑，可見明顯微血管擴張，易感到乾癢或刺痛。',
    imgUrl: 'https://www.scalpx.com.tw/dist/images/question/%E6%95%8F%E6%84%9F%E6%80%A7%E9%A0%AD%E7%9A%AE.jpg', // Abstract red texture
    characteristics: [
      '顏色：粉紅、暗紅或膚色不均',
      '血管：可見微血管擴張 (紅血絲)',
      '感受：乾癢、緊繃、刺痛',
      '成因：壓力、睡眠不足、化學傷害'
    ],
    careAdvice: '暫停刺激性療程 (染燙)，選用溫和舒緩洗髮精，加強鎮定保濕。'
  },
  {
    id: 'oily',
    title: '油性/阻塞頭皮',
    subtitle: 'Oily / Clogged',
    icon: Droplets,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    description: '油脂分泌旺盛，毛孔周圍堆積固態油脂 (角質栓)，導致毛孔呈現平坦或阻塞狀。',
    imgUrl: 'https://tse1.mm.bing.net/th/id/OIP.ZTzy16qS0wbwBuv-PEd8OwHaFj?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3', // Oil texture
    characteristics: [
      '顏色：偏黃、油亮',
      '毛孔：被油脂填平，無漏斗狀',
      '氣味：容易產生油耗味',
      '風險：易導致毛囊炎與落髮'
    ],
    careAdvice: '定期進行深層頭皮淨化 (去角質)，注意水油平衡，避免過熱水溫洗頭。'
  },
  {
    id: 'dandruff',
    title: '皮屑/角質異常',
    subtitle: 'Dandruff / Keratin',
    icon: Sparkles,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    description: '表皮細胞代謝異常，出現肉眼可見的片狀或塊狀皮屑，常伴隨皮屑芽孢菌增生。',
    imgUrl: 'https://www.scalpx.com.tw/dist/images/question/%E9%A0%AD%E7%9A%AE%E5%B1%91.jpg', // Texture resembling flakes
    characteristics: [
      '外觀：雪花片狀 (乾性) 或 塊狀 (油性)',
      '角質：毛孔周圍有白色包覆物',
      '成因：菌群失衡、免疫力下降',
      '伴隨：可能伴隨搔癢感'
    ],
    careAdvice: '使用抗屑調理產品，改善頭皮菌群環境，增強頭皮免疫力。'
  },
  {
    id: 'hairloss',
    title: '落髮/稀疏徵兆',
    subtitle: 'Hair Loss / Thinning',
    icon: AlertTriangle,
    color: 'text-stone-600',
    bg: 'bg-stone-100',
    description: '毛囊萎縮導致頭髮變細 (微型化)，或是出現空毛囊、一孔一髮的現象。',
    imgUrl: 'https://www.scalpx.com.tw/dist/images/question/%E8%90%BD%E9%AB%AE%E5%95%8F%E9%A1%8C.jpg', // Sparse texture
    characteristics: [
      '密度：明顯降低，頭皮外露範圍大',
      '粗細：細軟髮比例增加 (>20%)',
      '毛孔：出現空毛囊 (黃點/黑點)',
      '髮根：髮根細軟，缺乏支撐力'
    ],
    careAdvice: '及早進行毛囊活化課程，補充育髮營養，必要時諮詢醫師。'
  }
];

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState<typeof TOPICS[0] | null>(null);

  return (
    <div className="min-h-screen bg-stone-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-orange-700" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-stone-800">頭皮衛教知識庫</h1>
                <p className="text-xs text-stone-500">Scalp Education & Reference</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!selectedTopic ? (
          /* Grid View */
          <>
            <div className="mb-8">
                <h2 className="text-lg font-bold text-stone-800 mb-2">常見頭皮類型圖鑑</h2>
                <p className="text-stone-500 text-sm">點擊下方卡片查看詳細特徵與護理建議，可協助顧客進行視覺比對。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 text-left transition-all hover:shadow-md hover:border-orange-300 group relative overflow-hidden"
                >
                   <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${topic.color}`}>
                       <topic.icon className="w-24 h-24" />
                   </div>

                   <div className={`w-12 h-12 rounded-xl ${topic.bg} ${topic.color} flex items-center justify-center mb-4`}>
                      <topic.icon className="w-6 h-6" />
                   </div>
                   
                   <h3 className="text-lg font-bold text-stone-800 mb-1">{topic.title}</h3>
                   <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">{topic.subtitle}</p>
                   
                   <p className="text-sm text-stone-600 line-clamp-2">{topic.description}</p>
                   
                   <div className="mt-6 text-sm font-bold text-orange-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      查看詳情 <ArrowLeft className="w-4 h-4 rotate-180" />
                   </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Detail View */
          <div className="animate-fade-in-up max-w-4xl mx-auto">
             <button 
               onClick={() => setSelectedTopic(null)}
               className="text-stone-500 hover:text-stone-800 font-bold text-sm mb-6 flex items-center gap-1"
             >
                <ArrowLeft className="w-4 h-4" /> 返回列表
             </button>

             <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden">
                {/* Hero Section */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                   <img src={selectedTopic.imgUrl} alt={selectedTopic.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                       <div className="text-white">
                           <div className="flex items-center gap-2 mb-2">
                               <selectedTopic.icon className="w-6 h-6 text-white/90" />
                               <span className="text-sm font-bold opacity-80 uppercase tracking-widest">{selectedTopic.subtitle}</span>
                           </div>
                           <h2 className="text-3xl font-bold">{selectedTopic.title}</h2>
                       </div>
                   </div>
                </div>

                <div className="p-8">
                   <p className="text-lg text-stone-700 leading-relaxed font-medium mb-8 border-l-4 border-orange-500 pl-4">
                       {selectedTopic.description}
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-stone-50 rounded-2xl p-6">
                           <h3 className="text-stone-800 font-bold flex items-center gap-2 mb-4">
                               <Sparkles className="w-5 h-5 text-orange-600" />
                               外觀特徵 (Characteristics)
                           </h3>
                           <ul className="space-y-3">
                               {selectedTopic.characteristics.map((char, i) => (
                                   <li key={i} className="flex items-start gap-3 text-sm text-stone-700">
                                       <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                                       {char}
                                   </li>
                               ))}
                           </ul>
                       </div>

                       <div className="bg-emerald-50 rounded-2xl p-6">
                           <h3 className="text-emerald-900 font-bold flex items-center gap-2 mb-4">
                               <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                               護理建議 (Care Advice)
                           </h3>
                           <p className="text-sm text-emerald-800 leading-relaxed">
                               {selectedTopic.careAdvice}
                           </p>
                           <div className="mt-4 pt-4 border-t border-emerald-100 text-xs text-emerald-600 font-medium">
                               * 建議搭配現場 M-13 儀器檢測，以獲取更精準的數據分析。
                           </div>
                       </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
