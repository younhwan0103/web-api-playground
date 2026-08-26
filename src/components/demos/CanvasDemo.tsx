import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const COUNTS = [200, 1000, 5000] as const;

export default function CanvasDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState<number>(1000);
  const [attract, setAttract] = useState(true);

  // 리렌더 없이 매 프레임 읽어야 하는 값은 ref에 둔다.
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const attractRef = useRef(attract);
  attractRef.current = attract;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;

    // Canvas는 CSS 크기와 픽셀 버퍼 크기가 별개!
    // 안하면 고DPI 화면에서 흐릿하게 나옴
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }));

    let raf = 0;

    function frame() {
      ctx!.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const pulling = attractRef.current;

      ctx!.fillStyle = "#404040";

      for (const p of particles) {
        if (pulling) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 40000 && distSq > 1) {
            const inv = 1 / Math.sqrt(distSq);
            p.vx += dx * inv * 0.08;
            p.vy += dy * inv * 0.08;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99; // 감쇠
        p.vy *= 0.99;

        // 가장자리에서 반사
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // 점 하나에 fillRect. arc()보다 훨씬 빠르다.
        ctx!.fillRect(p.x, p.y, 1.5, 1.5);
      }

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      frame(); // 한 프레임만 그리고 멈춘다
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [count]);

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => setCount(c)}
            className={
              c === count
                ? "rounded bg-neutral-900 px-3 py-1 text-white"
                : "rounded border px-3 py-1"
            }
          >
            {c.toLocaleString("ko-KR")}개
          </button>
        ))}
        <button
          onClick={() => setAttract((a) => !a)}
          className={
            attract
              ? "rounded bg-neutral-900 px-3 py-1 text-white"
              : "rounded border px-3 py-1"
          }
        >
          마우스 끌림 {attract ? "켬" : "끔"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => (pointerRef.current = { x: -9999, y: -9999 })}
        className="h-72 w-full touch-none rounded-md border bg-neutral-50"
      />

      <p className="text-xs text-neutral-500">
        캔버스 위에서 마우스를 움직여보세요.
      </p>
    </div>
  );
}
