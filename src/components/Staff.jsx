import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabase";

const BUCKET = "staff-photos";
const SPEED = 45;

function StaffCard({ x, getPhotoUrl }) {
  const img = getPhotoUrl(x.photo_path);

  return (
    <div className="border my-2 border-base-300 shadow hover:shadow-md transition-all duration-300 flex flex-col gap-4 p-4 bg-[var(--bg-card)] rounded-lg hover:-translate-y-0.5 w-[280px] sm:w-[340px] lg:w-[260px] shrink-0">
      <div className="w-full aspect-[3/3] rounded-lg overflow-hidden bg-base-200">
        {img ? (
          <img src={img} alt={x.name || "xodim"} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm opacity-60">Rasm yo‘q</div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-[var(--text-main)] leading-snug line-clamp-2">{x.name}</h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{x.description || "—"}</p>
      </div>
    </div>
  );
}

export default function Staff() {
  const trackRef = useRef(null);
  const laneRef = useRef(null);
  const rafRef = useRef(null);

  const pausedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const stepRef = useRef(0);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const canAuto = useMemo(() => items.length >= 2, [items.length]);

  const getPhotoUrl = useCallback((photo_path) => {
    if (!photo_path) return null;
    if (/^https?:\/\//.test(photo_path)) return photo_path;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo_path);
    return data?.publicUrl || null;
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("staff").select("id,name,description,photo_path,order_index,is_active").eq("is_active", true).order("order_index", { ascending: true });

      if (!alive) return;

      if (!error && data) setItems(data);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
  };

  const measureStep = useCallback(() => {
    const lane = laneRef.current;
    if (!lane) return 0;

    const first = lane.firstElementChild;
    if (!first) return 0;

    const cardW = first.getBoundingClientRect().width;
    const styles = window.getComputedStyle(lane);
    const gapStr = styles.columnGap || styles.gap || "0px";
    const gap = parseFloat(gapStr) || 0;

    return cardW + gap;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loading || !items.length) return;

    track.scrollLeft = 0;
    lastTimeRef.current = performance.now();
    stepRef.current = measureStep();
  }, [loading, items.length, measureStep]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loading || !canAuto) return;

    const tick = (now) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (!pausedRef.current) {
        track.scrollLeft += SPEED * dt;

        const step = stepRef.current || 0;
        if (step > 0) {
          while (track.scrollLeft >= step) {
            track.scrollLeft -= step;
            setItems((prev) => {
              if (prev.length < 2) return prev;
              const [first, ...rest] = prev;
              return [...rest, first];
            });
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      const t = trackRef.current;
      if (!t) return;
      t.scrollLeft = 0;
      lastTimeRef.current = performance.now();
      stepRef.current = measureStep();
    };

    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [loading, canAuto, measureStep]);

  if (!loading && items.length === 0) return null;

  return (
    <div className="container mx-auto mt-20 mb-16 px-4">
      <h2 className="text-2xl md:text-3xl font-medium text-[var(--text-main)] mb-8">Xodimlar</h2>

      <div ref={trackRef} className="overflow-hidden" onMouseEnter={pause} onMouseLeave={resume} onTouchStart={pause} onTouchEnd={resume}>
        <div ref={laneRef} className="flex w-max gap-4 lg:gap-5 pr-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border border-base-300 my-2 shadow rounded-lg p-4 bg-[var(--bg-card)] flex flex-col gap-3.5 w-[280px] sm:w-[340px] lg:w-[260px] shrink-0">
                  <div className="skeleton w-full aspect-[3/3] rounded-lg" />
                  <div className="skeleton h-5 w-dull rounded mt-2" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              ))
            : items.map((x) => <StaffCard key={x.id} x={x} getPhotoUrl={getPhotoUrl} />)}
        </div>
      </div>
    </div>
  );
}
