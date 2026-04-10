"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { routePoints, getPointAtProgress, getRouteLength } from "@/lib/routePoints";

export default function RouteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const opacityRef = useRef(0);
  const pulseRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Main scroll trigger for route progress
    const scrollTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    // Opacity fade in after hero
    const fadeInTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "5% top",
      end: "15% top",
      scrub: true,
      onUpdate: (self) => {
        opacityRef.current = Math.min(self.progress * 0.9, 0.9);
      },
    });

    // Dim opacity at finish section
    const dimTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "85% top",
      end: "95% top",
      scrub: true,
      onUpdate: (self) => {
        if (self.progress > 0) {
          opacityRef.current = 0.9 - self.progress * 0.7;
        }
      },
    });

    // Helper to draw smooth curve through points
    const drawSmoothCurve = (
      points: { x: number; y: number }[],
      progress: number,
      panY: number,
      strokeStyle: string,
      lineWidth: number
    ) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const routeHeight = h; // Route spans one viewport height

      ctx.beginPath();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const totalLength = getRouteLength(routePoints);
      const targetLength = progress * totalLength;
      let accumulatedLength = 0;

      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        // Apply panning - as panY increases, shift the route up
        const x = point.x * w;
        const y = point.y * routeHeight - panY * routeHeight + h * 0.5;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevPoint = points[i - 1];
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const segmentLength = Math.sqrt(dx * dx + dy * dy);

          if (accumulatedLength + segmentLength <= targetLength) {
            // Draw full segment
            ctx.lineTo(x, y);
            accumulatedLength += segmentLength;
          } else if (accumulatedLength < targetLength) {
            // Draw partial segment
            const remainingLength = targetLength - accumulatedLength;
            const segmentProgress = remainingLength / segmentLength;
            const partialX = prevPoint.x + dx * segmentProgress;
            const partialY = prevPoint.y + dy * segmentProgress;
            ctx.lineTo(
              partialX * w,
              partialY * routeHeight - panY * routeHeight + h * 0.5
            );
            break;
          }
        }
      }

      ctx.stroke();
    };

    // Draw ghost trail (full route)
    const drawGhostTrail = (panY: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const routeHeight = h;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(242, 237, 228, 0.08)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      routePoints.forEach((point, i) => {
        const x = point.x * w;
        const y = point.y * routeHeight - panY * routeHeight + h * 0.5;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    // Draw kilometer markers
    const drawKmMarkers = (progress: number, panY: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const routeHeight = h;
      const totalLength = getRouteLength(routePoints);

      routePoints.forEach((point, index) => {
        if (point.km === undefined) return;

        // Calculate progress at this point
        let accLength = 0;
        for (let i = 1; i <= index; i++) {
          const dx = routePoints[i].x - routePoints[i - 1].x;
          const dy = routePoints[i].y - routePoints[i - 1].y;
          accLength += Math.sqrt(dx * dx + dy * dy);
        }
        const pointProgress = accLength / totalLength;

        // Only show if passed
        if (progress < pointProgress) return;

        const x = point.x * w;
        const y = point.y * routeHeight - panY * routeHeight + h * 0.5;

        // Skip if off screen
        if (y < -50 || y > h + 50) return;

        // Draw dot
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(242, 237, 228, 0.5)";
        ctx.fill();

        // Draw label
        ctx.font = "12px monospace";
        ctx.fillStyle = "rgba(242, 237, 228, 0.5)";
        ctx.textAlign = "right";
        ctx.fillText(`${point.km}k`, x - 12, y + 4);
      });
    };

    // Draw runner dot with pulse
    const drawRunner = (progress: number, panY: number, pulsePhase: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const routeHeight = h;

      const pos = getPointAtProgress(routePoints, progress);
      const x = pos.x * w;
      const y = pos.y * routeHeight - panY * routeHeight + h * 0.5;

      // Pulse ring
      const pulseSize = 8 + pulsePhase * 20;
      const pulseOpacity = 0.6 * (1 - pulsePhase);
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 85, 60, ${pulseOpacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer coral dot
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#E8553C";
      ctx.fill();

      // Inner sand dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#F2EDE4";
      ctx.fill();
    };

    // Draw finish marker
    const drawFinishMarker = (progress: number, panY: number) => {
      if (progress < 0.92) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const routeHeight = h;

      const lastPoint = routePoints[routePoints.length - 1];
      const x = lastPoint.x * w;
      const y = lastPoint.y * routeHeight - panY * routeHeight + h * 0.5;

      const opacity = Math.min((progress - 0.92) / 0.08, 1);

      // Flag line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 40);
      ctx.strokeStyle = `rgba(242, 237, 228, ${opacity * 0.6})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // FINISH text
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = `rgba(232, 85, 60, ${opacity})`;
      ctx.textAlign = "right";
      ctx.fillText("FINISH", x - 10, y - 45);
    };

    // Animation loop
    let animationId: number;
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Apply global opacity
      ctx.globalAlpha = opacityRef.current;

      const progress = progressRef.current;
      const panY = progress; // panY equals progress - scroll down = route travels down

      // Update pulse animation
      pulseRef.current = (pulseRef.current + 0.02) % 1;

      // Draw layers
      drawGhostTrail(panY);
      drawSmoothCurve(
        routePoints,
        progress,
        panY,
        "rgba(232, 85, 60, 0.7)",
        4
      );
      drawKmMarkers(progress, panY);
      drawRunner(progress, panY, pulseRef.current);
      drawFinishMarker(progress, panY);

      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
      scrollTrigger.kill();
      fadeInTrigger.kill();
      dimTrigger.kill();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 1 }}
    />
  );
}
