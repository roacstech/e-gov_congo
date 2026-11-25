"use client";

import React from "react";

export function AnimatedCheckmark({ size = 56 }: { size?: number }) {
  return (
    <div className="relative inline-flex items-center justify-center no-print">
      {/* Subtle celebratory pulse ripple */}
      <span className="absolute w-14 h-14 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />

      {/* Main checkmark container with scale-spring pop */}
      <div
        className="relative rounded-full bg-blue-50 flex items-center justify-center shadow-xs animate-checkmark-pop"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 52 52"
          className="text-blue-600 block"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated Outer Circle */}
          <circle
            cx="26"
            cy="26"
            r="23"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-checkmark-circle"
          />
          {/* Animated Checkmark */}
          <path
            d="M15.5 27.2L22.5 34.2L36.5 19.8"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-checkmark-check"
          />
        </svg>
      </div>
    </div>
  );
}
