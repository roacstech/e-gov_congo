"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Language } from "@/types";
import { Eraser, PenTool, Check } from "lucide-react";

interface SignaturePadProps {
  language: Language;
  officerName?: string;
  officerId?: string;
  roleTitle?: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  language,
  value,
  onChange,
}) => {
  const isFr = language === "fr";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.4;
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    isDrawingRef.current = true;
    hasDrawnRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasDrawnRef.current) {
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    hasDrawnRef.current = false;
    initCanvas();
    onChange(null);
  };

  return (
    <div className="space-y-1.5 max-w-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PenTool className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-xs font-semibold text-gray-800">
            {isFr ? "Signature" : "Sign"}
          </span>
          {value && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
              <Check className="w-3 h-3" />
              {isFr ? "Signé" : "Signed"}
            </span>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[11px] font-medium text-gray-700 cursor-pointer"
          >
            <Eraser className="w-3 h-3" />
            <span>{isFr ? "Effacer" : "Clear"}</span>
          </button>
        )}
      </div>

      <div className="relative bg-white border border-gray-300 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={360}
          height={96}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-20 touch-none cursor-crosshair block"
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-gray-400">
            {isFr ? "Signez ici..." : "Sign here..."}
          </div>
        )}
      </div>
    </div>
  );
};
