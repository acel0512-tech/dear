
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, ScanLine, SunMedium, Loader2, Focus, RefreshCw, Settings2 } from 'lucide-react';
import { compressImage } from '../services/imageCompressionService';

interface ScalpCameraProps {
  onCapture: (imageSrc: string) => void;
  modeLabel?: string;
}

const ScalpCamera: React.FC<ScalpCameraProps> = ({ onCapture, modeLabel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanLinePos, setScanLinePos] = useState(0);
  const [showDeviceList, setShowDeviceList] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setScanLinePos(prev => (prev + 1.5) % 100), 50);
    return () => clearInterval(interval);
  }, [isActive]);

  // 獲取所有攝像設備並嘗試尋找 USB 顯微鏡
  const refreshDevices = async () => {
    try {
      // 先請求權限以獲取設備標籤
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

      if (videoDevices.length > 0) {
        // 優先邏輯：尋找關鍵字
        const microscope = videoDevices.find(d => {
          const label = d.label.toLowerCase();
          return label.includes('microscope') || label.includes('usb') || label.includes('endoscope') || label.includes('uv');
        });
        
        // 如果沒找到關鍵字，但只有一個外接設備，通常就是它
        if (microscope) {
          setSelectedDeviceId(microscope.deviceId);
        } else if (!selectedDeviceId) {
          // 如果沒有選定且沒有關鍵字，預設選最後一個（外接設備通常在列表後方）
          setSelectedDeviceId(videoDevices[videoDevices.length - 1].deviceId);
        }
      }
      stream.getTracks().forEach(t => t.stop());
    } catch (e) {
      console.error("無法列出鏡頭設備", e);
    }
  };

  useEffect(() => {
    if (isActive) refreshDevices();
  }, [isActive]);

  useEffect(() => {
    if (isActive && selectedDeviceId) {
        const start = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: { 
                    deviceId: { exact: selectedDeviceId }, 
                    width: { ideal: 1920 }, 
                    height: { ideal: 1080 } 
                  }
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("無法啟動選定鏡頭", err);
            }
        };
        start();
    }
    return () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
    };
  }, [isActive, selectedDeviceId]);

  const handleCapture = useCallback(async () => {
    if (isCapturing || !videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const compressed = await compressImage(canvas.toDataURL('image/jpeg', 0.95));
      onCapture(compressed);
      setIsActive(false);
    }
    setIsCapturing(false);
  }, [onCapture]);

  if (!isActive) {
    return (
      <button 
        type="button" 
        onClick={() => setIsActive(true)} 
        className="w-full h-full min-h-[140px] bg-white border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 hover:border-orange-500 hover:text-orange-600 transition-all flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 group"
      >
        <div className="p-3 bg-stone-50 rounded-full group-hover:bg-orange-50 transition-colors">
          <Camera className="w-8 h-8" />
        </div>
        <span className="font-bold text-sm tracking-widest">{modeLabel || '開啟光譜儀'}</span>
      </button>
    );
  }

  const currentDeviceLabel = devices.find(d => d.deviceId === selectedDeviceId)?.label || '偵測中...';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans overflow-hidden animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* HUD Guide Overlays */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute top-[50%] left-0 w-full h-[1px] bg-orange-500/20"></div>
        <div className="absolute left-[50%] top-0 h-full w-[1px] bg-orange-500/20"></div>
        {/* Focusing Box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-white/20 rounded-3xl flex items-center justify-center">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
        </div>
        {/* Animated Scanning Line */}
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent absolute left-0 shadow-[0_0_15px_rgba(249,115,22,0.5)]" style={{ top: `${scanLinePos}%` }}></div>
      </div>

      {/* Top Header Controls */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full flex justify-between items-center z-40">
        <div className="flex flex-col">
            <span className="text-white font-black text-xs tracking-[0.3em] uppercase">{modeLabel || 'Spectrum Analysis'}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-orange-500 text-[10px] font-mono animate-pulse">● OPTICAL ACTIVE</span>
              <span className="text-white/40 text-[10px] font-mono">| {currentDeviceLabel}</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowDeviceList(!showDeviceList)}
            className={`p-2 rounded-full border transition-all ${showDeviceList ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/10 border-white/20 text-white'}`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button onClick={() => setIsActive(false)} className="text-white/60 hover:text-white p-2 transition-colors"><X className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Device Selection Menu (Popup) */}
      {showDeviceList && (
        <div className="absolute top-20 right-6 w-64 bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-2xl z-50 p-2 shadow-2xl animate-fade-in-up">
          <div className="px-3 py-2 text-white/40 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 mb-1 flex justify-between items-center">
            切換檢測鏡頭
            <button onClick={refreshDevices}><RefreshCw className="w-3 h-3 hover:text-white" /></button>
          </div>
          {devices.map(device => (
            <button
              key={device.deviceId}
              onClick={() => { setSelectedDeviceId(device.deviceId); setShowDeviceList(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${selectedDeviceId === device.deviceId ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/5'}`}
            >
              <span className="truncate pr-2">{device.label || `鏡頭 ${device.deviceId.slice(0, 4)}`}</span>
              {selectedDeviceId === device.deviceId && <RefreshCw className="w-3 h-3 animate-spin-slow" />}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 bg-black flex items-center justify-center relative">
        <video ref={videoRef} autoPlay playsInline muted className="max-h-full max-w-full object-contain" />
      </div>

      <div className="p-8 md:p-12 bg-gradient-to-t from-black to-transparent flex justify-center items-center z-40">
        <button 
          onClick={handleCapture} 
          disabled={isCapturing} 
          className="relative w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center active:scale-95 transition-all hover:border-white/40 group"
        >
          {/* Inner Ring Decor */}
          <div className="absolute inset-2 rounded-full border border-white/10 group-hover:scale-110 transition-transform"></div>
          
          <div className="w-16 h-16 rounded-full bg-white group-hover:bg-orange-50 flex items-center justify-center shadow-2xl">
              {isCapturing ? <Loader2 className="w-8 h-8 text-orange-800 animate-spin" /> : <div className="w-12 h-12 rounded-full border-2 border-stone-900/10 flex items-center justify-center"><Camera className="w-7 h-7 text-stone-900" /></div>}
          </div>
          
          {/* Status Dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-black animate-pulse"></div>
        </button>
      </div>

      {/* Camera Footer Info */}
      <div className="absolute bottom-6 left-6 text-white/30 text-[9px] font-mono tracking-widest uppercase pointer-events-none hidden md:block">
        M-13 Precise Optical Sensor Interface v2.0
      </div>
    </div>
  );
};

export default ScalpCamera;
