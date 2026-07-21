import { useEffect, useRef, useState } from "react";

// ── Respect the OS "reduce motion" setting ──────────────────
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

// ── Fire a callback once the element scrolls into view ──────
// Metric tiles only animate when the analyst can actually see them.
export function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Typewriter reveal ───────────────────────────────────────
// Streams a string in word-by-word so an AI answer *arrives* rather
// than blinking into existence. Returns the revealed slice + a done
// flag so callers can hold citations/actions until the text lands.
export function useTypewriter(text: string, { speed = 18, enabled = true } = {}) {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced || !enabled ? text.length : 0);
  const words = text.split(/(\s+)/); // keep whitespace tokens

  useEffect(() => {
    if (reduced || !enabled) {
      setCount(words.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= words.length) clearInterval(id);
    }, speed * 4);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, reduced]);

  const shown = reduced || !enabled ? text : words.slice(0, count).join("");
  return { shown, done: count >= words.length };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// ── Count a number up from 0 → target with easing ───────────
// Parses the numeric core out of a display string ("€175.4m",
// "1,503 MW", "88") so callers keep passing pre-formatted values.
export function useCountUp(display: string, run: boolean, duration = 750) {
  const reduced = usePrefersReducedMotion();
  const match = display.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  const [out, setOut] = useState(display);
  const started = useRef(false);

  useEffect(() => {
    // No number to animate, motion disabled, or not yet triggered → show final.
    if (!match || reduced || !run) {
      setOut(display);
      return;
    }
    if (started.current) return;
    started.current = true;

    const [, prefix, rawNum, suffix] = match;
    const hasComma = rawNum.includes(",");
    const decimals = rawNum.includes(".") ? rawNum.split(".")[1].length : 0;
    const target = parseFloat(rawNum.replace(/,/g, ""));
    const t0 = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const fixed = (target * easeOutCubic(p)).toFixed(decimals);
      const [int, dec] = fixed.split(".");
      const withCommas = hasComma ? Number(int).toLocaleString("en-US") : int;
      setOut(`${prefix}${withCommas}${dec ? "." + dec : ""}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, run, reduced]);

  return out;
}
