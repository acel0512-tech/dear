
import React, { useEffect, useState } from 'react';
import { LINE_LIFF_ID } from '../constants';
import { Loader2, Copy, Check, AlertTriangle, User } from 'lucide-react';

// Declare liff globally
declare var liff: any;

const LineLiffHelper: React.FC = () => {
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
  const [profile, setProfile] = useState<{ userId: string; displayName: string; pictureUrl?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        if (!LINE_LIFF_ID || LINE_LIFF_ID === "YOUR_LIFF_ID_HERE") {
            throw new Error("尚未設定 LIFF ID。請通知管理員至 constants.ts 設定。");
        }

        // Initialize LIFF
        await liff.init({ liffId: LINE_LIFF_ID });

        if (!liff.isLoggedIn()) {
          // If not logged in, force login (redirects to LINE Login)
          liff.login();
        } else {
          // Get User Profile
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
          setStatus('READY');
        }
      } catch (err: any) {
        console.error("LIFF Init Error:", err);
        setStatus('ERROR');
        setErrorMsg(err.message || "初始化失敗");
      }
    };

    initLiff();
  }, []);

  const copyToClipboard = () => {
    if (profile?.userId) {
      navigator.clipboard.writeText(profile.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeWindow = () => {
    if (liff.isInClient()) {
        liff.closeWindow();
    } else {
        window.close();
    }
  };

  if (status === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">正在連接 LINE...</h2>
        <p className="text-slate-500 mt-2">請稍候，正在讀取您的資料</p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">連接失敗</h2>
        <p className="text-slate-500 mt-2 mb-6">{errorMsg}</p>
        <div className="text-xs text-slate-400 bg-white p-4 rounded border border-slate-200 break-all">
            請確認 LIFF ID 是否正確，且 Endpoint URL 已設定為當前網址。
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-center text-white">
          <h1 className="text-xl font-bold mb-1">訫肌頭皮管理</h1>
          <p className="text-emerald-100 text-sm">LINE 綁定助手</p>
        </div>

        {/* Profile */}
        <div className="p-8 flex flex-col items-center">
           <div className="relative mb-4">
              {profile?.pictureUrl ? (
                  <img src={profile.pictureUrl} alt="User" className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm" />
              ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <User className="w-10 h-10" />
                  </div>
              )}
              <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
           </div>
           
           <h2 className="text-xl font-bold text-slate-800">{profile?.displayName}</h2>
           <p className="text-slate-500 text-sm mb-6">您好，請將下方 ID 提供給門市顧問</p>

           {/* ID Box */}
           <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 relative group">
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">User ID</p>
              <p className="font-mono text-slate-700 break-all font-bold text-lg leading-tight">
                  {profile?.userId}
              </p>
              
              <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
              >
                 {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
           </div>

           {/* Action Buttons */}
           <div className="w-full space-y-3">
              <button 
                onClick={copyToClipboard}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    copied 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                }`}
              >
                 {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                 {copied ? '已複製' : '複製 User ID'}
              </button>
              
              <button 
                onClick={closeWindow}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                 關閉視窗
              </button>
           </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs text-center max-w-xs">
          此頁面僅用於協助門市人員取得您的 LINE 推播識別碼，不會蒐集其他個人資訊。
      </p>
    </div>
  );
};

export default LineLiffHelper;
