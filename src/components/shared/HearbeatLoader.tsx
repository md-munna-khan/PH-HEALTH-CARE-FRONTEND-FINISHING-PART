"use client";
import { Activity } from "lucide-react";

interface HeartbeatLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  showIcon?: boolean;
}

const SIZE_CLASSES = {
  sm: { container: "w-20 h-20", text: "text-[10px]", icon: 12 },
  md: { container: "w-32 h-32", text: "text-[13.6px]", icon: 16 },
  lg: { container: "w-48 h-48", text: "text-[18px]", icon: 24 },
  xl: { container: "w-64 h-64", text: "text-[24px]", icon: 32 },
} as const;

export default function HeartbeatLoader({
  text = "Next Level healthcare...",
  size = "md",
  className = "",
  animated = true,
  showIcon = false,
}: HeartbeatLoaderProps) {
  const { container, text: textSize, icon: iconSize } = SIZE_CLASSES[size];

  return (
    <div
      className={`flex flex-col items-center gap-4 ${className} justify-center min-h-screen`}
    >
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }

        @keyframes heartbeat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes draw-path {
          0% {
            stroke-dashoffset: 500;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }

        .heartbeat-icon {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        .heartbeat-path {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: draw-path 2s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }

        .fade-in-text {
          animation: fade-in-up 0.5s ease-out 0.5s both;
        }

        /* Disable animations when animated=false */
        .no-animation .pulse-ring,
        .no-animation .heartbeat-icon,
        .no-animation .heartbeat-path,
        .no-animation .pulse-glow,
        .no-animation .fade-in-text {
          animation: none;
        }

        .no-animation .heartbeat-path {
          stroke-dashoffset: 0;
        }
      `}</style>

      {/* Main Container */}
      <div
        className={`relative ${container} ${!animated ? "no-animation" : ""}`}
      >
        {/* Outer Pulsing Ring */}
        {animated && (
          <div className="pulse-ring absolute inset-0 rounded-full border-[3px] border-blue-500" />
        )}

        {/* Static Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-blue-500" />

        {/* Inner Container with Heartbeat */}
        <div className="absolute inset-[15%] flex items-center justify-center">
          {showIcon ? (
            <div className={animated ? "heartbeat-icon" : ""}>
              <Activity
                className="text-blue-500"
                size={iconSize}
                strokeWidth={2}
              />
            </div>
          ) : (
            <svg
              className="w-full h-full"
              style={{ transform: "scaleX(-1)" }}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 58 58"
            >
              <path
                className={animated ? "heartbeat-path" : ""}
                d="M52.744 28.7694H46.7983C45.7505 28.7672 44.7309 29.1082 43.8953 29.7403C43.0597 30.3724 42.4541 31.2609 42.1712 32.2697L36.5372 52.3124C36.5009 52.4369 36.4252 52.5463 36.3214 52.6241C36.2177 52.7019 36.0915 52.744 35.9618 52.744C35.8321 52.744 35.7059 52.7019 35.6022 52.6241C35.4984 52.5463 35.4227 52.4369 35.3864 52.3124L22.1525 5.22645C22.1162 5.10195 22.0404 4.99259 21.9367 4.91478C21.8329 4.83697 21.7068 4.79491 21.5771 4.79491C21.4474 4.79491 21.3212 4.83697 21.2175 4.91478C21.1137 4.99259 21.038 5.10195 21.0017 5.22645L15.3677 25.2692C15.0859 26.2741 14.4839 27.1596 13.6532 27.7913C12.8224 28.423 11.8082 28.7665 10.7646 28.7694H4.79491"
                stroke="#3B82F6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                style={{ strokeDasharray: animated ? 500 : undefined }}
              />
            </svg>
          )}
        </div>

        {/* Heartbeat Pulse Effect */}
        {animated && (
          <div className="pulse-glow absolute inset-[15%] rounded-full bg-blue-500/20" />
        )}
      </div>

      {/* Text */}
      {text && (
        <p
          className={`font-medium text-gray-600 text-center ${textSize} ${
            animated ? "fade-in-text" : ""
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
