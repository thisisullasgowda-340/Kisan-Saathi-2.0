import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCw, AlertCircle, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setPermissionError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setPermissionError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission was denied. Please allow camera permissions in your browser or phone settings.');
      } else {
        setPermissionError('Could not start camera. Please verify device camera is available or upload from gallery instead.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <div>
          <h3 className="font-bold text-base">Crop Leaf Camera</h3>
          <p className="text-xs text-slate-300">Align diseased leaf inside the central focus box</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder / Preview */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-black">
        {permissionError ? (
          <div className="max-w-md p-6 bg-slate-900 border border-rose-500/30 rounded-2xl text-center text-white space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="font-bold text-base text-rose-400">Camera Permission Required</h4>
            <p className="text-xs text-slate-300">{permissionError}</p>
            <button
              onClick={startCamera}
              className="kisan-btn-primary text-xs"
            >
              Retry Camera Permission
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured Leaf"
            className="w-full h-full object-contain rounded-2xl"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {/* Viewfinder Guideline Box */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-[#A5D6A7] rounded-3xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
              <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full uppercase tracking-wider">
                Position Leaf Here
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-6 pb-4 z-10">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Retake
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              Use Photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleFacingMode}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Switch Camera"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleCapture}
              disabled={!!permissionError}
              className="w-16 h-16 rounded-full bg-white hover:bg-slate-200 border-4 border-[#2E7D32] flex items-center justify-center text-[#2E7D32] shadow-xl transition-transform active:scale-95 disabled:opacity-50"
              title="Capture Leaf Photo"
            >
              <Camera className="w-7 h-7" />
            </button>
            <div className="w-11" /> {/* Spacer */}
          </>
        )}
      </div>
    </div>
  );
};
