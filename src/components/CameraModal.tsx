import React, { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CameraModalProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

export default function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pinch-to-zoom state
  const lastTouchDistance = useRef<number | null>(null);

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Set canvas dimensions to requested resolution: 10:8.22 ratio (e.g., 1920 x 1578)
        canvas.width = 1920;
        canvas.height = 1578;

        // Calculate source dimensions based on zoom and video aspect ratio
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        const targetAspect = 10 / 8.22;
        const videoAspect = videoWidth / videoHeight;

        let sourceWidth, sourceHeight;

        // Crop the video to match the target aspect ratio while respecting zoom
        if (videoAspect > targetAspect) {
          // Video is wider than target
          sourceHeight = videoHeight / zoom;
          sourceWidth = sourceHeight * targetAspect;
        } else {
          // Video is taller than target
          sourceWidth = videoWidth / zoom;
          sourceHeight = sourceWidth / targetAspect;
        }

        const x = (videoWidth - sourceWidth) / 2;
        const y = (videoHeight - sourceHeight) / 2;

        // Apply filters for document clarity (sharpness effect)
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.filter = "contrast(1.15) brightness(1.02) saturate(1.05)";

        context.drawImage(
          video,
          x,
          y,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        // Export as maximum quality JPG (100% quality)
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastTouchDistance.current = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY,
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY,
      );
      const delta = distance - lastTouchDistance.current;

      setZoom((prev) => {
        const newZoom = Math.min(Math.max(prev + delta * 0.01, 1), 3);
        return newZoom;
      });

      lastTouchDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{ aspectRatio: "10/8.22" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          />
        )}

        {/* Zoom Indicator */}
        <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
          {zoom.toFixed(1)}x
        </div>
      </div>

      <div className="mt-8 flex items-center gap-8">
        <button
          onClick={() => setIsFrontCamera(!isFrontCamera)}
          className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <RefreshCw size={24} />
        </button>

        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white p-1 hover:scale-105 transition-all active:scale-95"
        >
          <div className="w-full h-full rounded-full bg-white" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ZoomOut size={20} />
          </button>
        </div>
      </div>

      <p className="mt-6 text-white/60 text-sm font-medium">
        Position your passport horizontally. Use two fingers to zoom.
      </p>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
