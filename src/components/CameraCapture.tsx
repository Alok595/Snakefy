import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError(null);
    setIsReady(false);

    try {
      // Try environment camera first
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('Failed to get environment camera, falling back to any camera', e);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
        };
      }
    } catch (err: any) {
      console.error('Camera Error:', err);
      let message = 'Could not access camera.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera access denied. Please enable permissions in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError' || err.message?.includes('Could not start video source')) {
        message = 'Camera is already in use by another application or tab. Please close other apps using the camera and try again.';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isReady) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Use actual video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-neutral-900 overflow-hidden rounded-lg shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-neutral-950">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Camera Error</h3>
            <p className="text-neutral-400 mb-8 max-w-sm text-sm leading-relaxed">{error}</p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 border border-neutral-700 text-white rounded-full flex items-center gap-2 font-medium hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={startCamera}
                className="px-6 py-2.5 bg-white text-black rounded-full flex items-center gap-2 font-medium hover:bg-neutral-200 transition-colors"
              >
                <RefreshCw size={18} /> Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-neutral-700 animate-spin mb-4" />
                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Initializing Hardware...</p>
              </div>
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6">
          <button 
            onClick={capturePhoto}
            disabled={!isReady}
            className="w-16 h-16 bg-white rounded-full border-4 border-neutral-300 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-20 disabled:scale-90"
          >
            <div className="w-12 h-12 bg-white rounded-full border-2 border-black" />
          </button>
          <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
            <p className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
              {isReady ? 'Ready for capture' : 'Waiting for sensor...'}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-neutral-500 text-[10px] font-mono uppercase tracking-[0.3em]">Ophidia Sensor Unit v2.0</p>
    </div>
  );
};
