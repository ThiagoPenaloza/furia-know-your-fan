"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const HoverButton = React.forwardRef(
  (
    {
      className,
      children,
      startColor = "#93c5fd",
      endColor = "#3b82f6",
      animationIntensity = "medium",
      effectColors,
      ...props
    },
    ref
  ) => {
    const buttonRef = React.useRef(null);
    const [isListening, setIsListening] = React.useState(false);
    const [circles, setCircles] = React.useState([]);
    const lastAddedRef = React.useRef(0);

    const intensityConfig = {
      low: { throttle: 120, maxSize: 15 },
      medium: { throttle: 80, maxSize: 20 },
      high: { throttle: 50, maxSize: 30 },
    };

    const { throttle, maxSize } = intensityConfig[animationIntensity];

    const createCircle = React.useCallback(
      (x, y) => {
        const buttonWidth = buttonRef.current?.offsetWidth || 0;
        const xPos = x / buttonWidth;
        const colors =
          effectColors && effectColors.length > 0
            ? effectColors.map(
                (c) =>
                  `radial-gradient(circle at 50% 50%, ${c} ${
                    xPos * 100
                  }%, ${c} 100%)`
              )
            : [
                `radial-gradient(circle at 30% 30%, #ff6b6b, #4ecdc4 ${
                  xPos * 100
                }%)`,
                `radial-gradient(circle at 70% 70%, #a78bfa, #3b82f6 ${
                  xPos * 100
                }%)`,
                `radial-gradient(circle at 50% 50%, #facc15, #f472b6 ${
                  xPos * 100
                }%)`,
                `radial-gradient(circle at 30% 30%, ${startColor}, ${endColor} ${
                  xPos * 100
                }%)`,
              ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        setCircles((prev) => [
          ...prev,
          {
            id: Date.now(),
            x,
            y,
            color,
            fadeState: null,
            size: Math.random() * (maxSize - 10) + 10,
            rotation: Math.random() * 360,
          },
        ]);
      },
      [startColor, endColor, maxSize, effectColors]
    );

    const handlePointerMove = React.useCallback(
      (event) => {
        if (!isListening) return;
        const currentTime = Date.now();
        if (currentTime - lastAddedRef.current > throttle) {
          lastAddedRef.current = currentTime;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          createCircle(x, y);
        }
      },
      [isListening, createCircle, throttle]
    );

    const handlePointerEnter = React.useCallback(() => {
      setIsListening(true);
    }, []);

    const handlePointerLeave = React.useCallback(() => {
      setIsListening(false);
    }, []);

    React.useEffect(() => {
      circles.forEach((circle) => {
        if (!circle.fadeState) {
          setTimeout(() => {
            setCircles((prev) =>
              prev.map((c) =>
                c.id === circle.id ? { ...c, fadeState: "in" } : c
              )
            );
          }, 0);

          setTimeout(() => {
            setCircles((prev) =>
              prev.map((c) =>
                c.id === circle.id ? { ...c, fadeState: "out" } : c
              )
            );
          }, 800);

          setTimeout(() => {
            setCircles((prev) => prev.filter((c) => c.id !== circle.id));
          }, 2000);
        }
      });
    }, [circles]);

    return (
      <button
        ref={buttonRef}
        className={cn(
          "relative isolate px-10 py-4 rounded-full text-white font-semibold text-lg",
          "backdrop-blur-xl bg-[rgba(43,55,80,0.2)] shadow-2xl",
          "overflow-hidden transition-all duration-300 hover:scale-105",
          "before:content-[''] before:absolute before:inset-0",
          "before:rounded-[inherit] before:pointer-events-none before:z-[1]",
          "before:mix-blend-overlay before:transition-transform before:duration-300",
          "active:before:scale-[0.95] active:scale-95",
          className
        )}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {circles.map(({ id, x, y, color, fadeState, size, rotation }) => (
          <div
            key={id}
            className={cn(
              "absolute rounded-full blur-md pointer-events-none z-[-1]",
              "transition-all duration-500 ease-out",
              fadeState === "in" && "opacity-80 scale-100",
              fadeState === "out" && "opacity-0 scale-150",
              !fadeState && "opacity-0 scale-50"
            )}
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              background: color,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              boxShadow: `0 0 ${size / 2}px rgba(255, 255, 255, 0.3)`,
            }}
          />
        ))}
        {typeof children === "string" ? (
          <span className="relative z-10 drop-shadow-md">{children}</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

HoverButton.displayName = "HoverButton";

export { HoverButton };
