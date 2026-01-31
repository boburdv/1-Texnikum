import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase";
import { FaComputer, FaQuestion, FaRegGem } from "react-icons/fa6";
import { TbNeedleThread, TbPlug, TbFlame } from "react-icons/tb";
import { GiBee } from "react-icons/gi";
import { MdRestaurant } from "react-icons/md";
import News from "../components/News";
import Staff from "../components/Staff";

const iconMap = {
  "fa-computer": FaComputer,
  "tb-needle-thread": TbNeedleThread,
  "tb-plug": TbPlug,
  "gi-bee": GiBee,
  "tb-flame": TbFlame,
  "md-restaurant": MdRestaurant,
  "fa-gem": FaRegGem,
};

const DynamicSkeleton = () => (
  <div className="border border-base-300 shadow rounded-lg flex gap-4 p-4 sm:p-5 bg-[var(--bg-card)] items-center">
    <div className="skeleton w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2 justify-center">
      <div className="skeleton h-5 w-2/5 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
    </div>
  </div>
);

const StaticSkeleton = () => (
  <div className="border border-base-300 shadow rounded-lg p-4 flex flex-col gap-2 bg-[var(--bg-card)]">
    <div className="flex items-center gap-2">
      <div className="skeleton w-5 h-5 rounded-full" />
      <div className="skeleton h-5 w-2/5 rounded" />
    </div>
    <div className="skeleton h-4 w-full rounded mt-2" />
    <div className="skeleton h-4 w-4/5 rounded mt-1" />
    <div className="skeleton h-4 w-3/5 rounded mt-1" />
  </div>
);

export default function Home() {
  const [staticCategories, setStaticCategories] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    let cancelled = false;

    setLoading(true);

    try {
      const [staticRes, dynamicRes] = await Promise.all([supabase.from("static").select("*"), supabase.from("dynamic").select("*")]);

      if (cancelled) return;

      if (staticRes.data) setStaticCategories(staticRes.data);
      if (dynamicRes.data) setDynamicCategories(dynamicRes.data);
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <News />
      <Staff />

      {/* DYNAMIC */}
      <div className="container mx-auto mt-20 mb-10 px-4" id="yarmarka">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] mt-1" /> Yarmarka
          </h2>
          <p className="mt-1 text-sm md:text-base text-[var(--text-secondary)]">Talabalar tayyorlangan mahsulotlar</p>{" "}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <DynamicSkeleton key={i} />)
            : dynamicCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || FaQuestion;

                return (
                  <Link key={cat.id} to={`/category/${encodeURIComponent(cat.name)}`}>
                    <div className="border border-base-300 shadow hover:shadow-md transition-all duration-400 flex gap-4 p-4 sm:p-5 bg-[var(--bg-card)] rounded-lg hover:-translate-y-0.5">
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[var(--bg-muted)] rounded-full">
                        <Icon className="text-4xl text-[var(--primary)]" />
                      </div>

                      <div className="flex-1 flex flex-col justify-center gap-1">
                        <h3 className="text-xl font-semibold text-[var(--text-main)]">{cat.name}</h3>

                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{cat.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>

      {/* STATIC */}
      <div className="container mx-auto mt-24 mb-24 px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 text-[var(--text-main)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] mt-1" /> Yo'nalishlar
          </h2>

          <p className="mt-1 text-sm md:text-base text-[var(--text-secondary)]">Kasbiy taʼlim bo‘yicha mavjud yo‘nalishlar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <StaticSkeleton key={i} />)
            : staticCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || FaQuestion;

                return (
                  <Link key={cat.id} to={`/${encodeURIComponent(cat.name)}`}>
                    <div className="border border-base-300 shadow hover:shadow-md transition-all duration-400 flex flex-col gap-2 p-4 bg-[var(--bg-card)] rounded-lg hover:-translate-y-0.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-[var(--primary)]" />
                        <h2 className="text-xl font-semibold text-[var(--text-main)]">{cat.name}</h2>
                      </div>

                      <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">{cat.description}</p>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </div>
  );
}
