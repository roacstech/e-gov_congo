"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Language } from "@/types";
import { Eraser, PenTool, Sparkles, Check } from "lucide-react";

interface SignaturePadProps {
  language: Language;
  officerName: string;
  officerId: string;
  roleTitle: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  language,
  officerName,
  officerId,
  roleTitle,
  value,
  onChange,
}) => {
  const isFr = language === "fr";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  const [mode, setMode] = useState<"draw" | "stamp">("draw");
  const [customTypedSignature, setCustomTypedSignature] = useState<string | null>(
    null
  );
  const typedSignature = customTypedSignature ?? officerName;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f295c";
    ctx.lineWidth = 2.4;
  }, []);

  useEffect(() => {
    if (mode === "draw") {
      initCanvas();
    }
  }, [mode, initCanvas]);

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

  const generateOfficialStampSignature = () => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 480;
    offscreen.height = 140;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    const nameText = (typedSignature || officerName).trim();

    ctx.fillStyle = "#0f295c";
    ctx.font = "italic bold 32px Georgia, 'Times New Roman', serif";
    ctx.fillText(nameText, 24, 66);

    ctx.beginPath();
    ctx.moveTo(22, 80);
    ctx.bezierCurveTo(130, 92, 260, 68, 390, 82);
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "600 11px monospace";
    ctx.fillText(`${officerId} • ${roleTitle}`, 24, 110);

    onChange(offscreen.toDataURL("image/png"));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-slate-800">
            {isFr ? "Signature" : "Signature"}
          </span>
          {value && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" />
              {isFr ? "Signé" : "Signed"}
            </span>
          )}
        </div>

        <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setMode("draw");
              onChange(null);
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              mode === "draw"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isFr ? "Dessiner" : "Draw"}
          </button>
          <button
            type="button"
            onClick={() => setMode("stamp")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              mode === "stamp"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isFr ? "Cachet" : "Stamp"}
          </button>
        </div>
      </div>

      {mode === "draw" ? (
        <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={130}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-28 touch-none cursor-crosshair block"
          />
          {!value && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              {isFr ? "Signez ici..." : "Sign here..."}
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 border border-slate-200 text-[11px] text-slate-600 hover:text-rose-600 cursor-pointer shadow-2xs"
            >
              <Eraser className="w-3 h-3" />
              <span>{isFr ? "Effacer" : "Clear"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => setCustomTypedSignature(e.target.value)}
              placeholder={officerName}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500"
            />
            <button
              type="button"
              onClick={generateOfficialStampSignature}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFr ? "Appliquer" : "Apply"}</span>
            </button>
          </div>
          {value && (
            <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center">
              <img src={value} alt="Signature" className="max-h-20 object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
