import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Paintbrush } from 'lucide-react';

interface SignaturePadProps {
  id: string;
  onChange: (signatureDataUrl: string) => void;
  defaultValue?: string;
  title: string;
}

export default function SignaturePad({ id, onChange, defaultValue, title }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#002D54'; // Deep Blue to match brand colors

    // If defaultValue exists, load it
    if (defaultValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setIsEmpty(false);
      };
      img.src = defaultValue;
    }

    const handleResize = () => {
      // Avoid clearing canvas on small size fluctuations if we already drew
      // But we can re-sync the bounding box
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [defaultValue]);

  // Helper to get coordinates
  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch
    const coords = getCoordinates(e.nativeEvent);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e.nativeEvent);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignature();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if empty
    if (isEmpty) {
      onChange('');
      return;
    }

    // Export with high resolution scaled down
    // Create a temporary canvas at normal resolution to output nice quality
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width / 2;
    tempCanvas.height = canvas.height / 2;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      const dataUrl = tempCanvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center w-full" id={`sig-container-${id}`}>
      <span className="text-xs font-semibold text-[#002D54] tracking-wider mb-2 flex items-center gap-1.5 uppercase">
        <Paintbrush className="w-3.5 h-3.5" />
        {title}
      </span>
      <div className="relative w-full h-32 bg-slate-50 border border-dashed border-slate-300 rounded-lg overflow-hidden group hover:border-slate-400 transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
          id={`canvas-${id}`}
        />
        
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 text-xs">
            <span>Firme aquí</span>
            <span className="text-[10px] text-slate-300 mt-1">(Pantalla táctil o mouse)</span>
          </div>
        )}

        <button
          type="button"
          onClick={clear}
          className="absolute bottom-2 right-2 p-1.5 bg-white text-slate-500 border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 hover:text-red-500 transition-all duration-200"
          title="Borrar firma"
          id={`clear-sig-${id}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
