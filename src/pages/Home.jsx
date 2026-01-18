import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FaComputer, FaQuestion, FaRegGem } from "react-icons/fa6";
import { TbNeedleThread, TbPlug, TbFlame } from "react-icons/tb";
import { GiBee } from "react-icons/gi";
import { MdRestaurant } from "react-icons/md";

const iconMap = {
  "fa-computer": FaComputer,
  "tb-needle-thread": TbNeedleThread,
  "tb-plug": TbPlug,
  "gi-bee": GiBee,
  "tb-flame": TbFlame,
  "md-restaurant": MdRestaurant,
  "fa-gem": FaRegGem,
};

const StaticSkeleton = () => (
  <div className="border border-base-300 shadow rounded-lg p-4 flex flex-col gap-2 bg-[var(--bg-card)] animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-[var(--bg-muted)]" />
      <div className="h-5 w-2/5 rounded bg-[var(--bg-muted)]" />
    </div>
    <div className="h-4 w-full rounded bg-[var(--bg-muted)] mt-2" />
    <div className="h-4 w-4/5 rounded bg-[var(--bg-muted)] mt-1" />
    <div className="h-4 w-3/5 rounded bg-[var(--bg-muted)] mt-1" />
  </div>
);

const DynamicSkeleton = () => (
  <div className="border border-base-300 shadow rounded-lg flex gap-4 p-4 sm:p-5 bg-[var(--bg-card)] animate-pulse">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--bg-muted)] flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2 justify-center">
      <div className="h-5 w-2/5 rounded bg-[var(--bg-muted)]" />
      <div className="h-4 w-full rounded bg-[var(--bg-muted)]" />
      <div className="h-4 w-4/5 rounded bg-[var(--bg-muted)]" />
    </div>
  </div>
);

export default function Home() {
  const [staticCategories, setStaticCategories] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [staticData, dynamicData] = await Promise.all([supabase.from("static").select("*"), supabase.from("dynamic").select("*")]);
      if (staticData.data) setStaticCategories(staticData.data);
      if (dynamicData.data) setDynamicCategories(dynamicData.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="relative w-full h-[450px] md:h-[500px] lg:h-[550px] mt-[100px]">
        <img src="/home-img.jpg" alt="hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full max-w-6xl text-white text-center md:text-left space-y-4 md:space-y-6 px-4">
            <span className="inline-block bg-[var(--primary)] px-4 py-1.5 rounded-full text-sm font-semibold mx-auto md:mx-0">RISHTON TUMAN</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-snug uppercase">1-son Texnikumi</h1>
            <p className="text-base md:text-lg font-medium text-white/90 max-w-lg mx-auto md:mx-0">
              Zamonaviy kasblar bo‘yicha malakali mutaxassislar tayyorlanadi, o‘quvchilar esa amaliy mashg‘ulotlar orqali bilimlarini mustahkamlash bilan birga, yarmarkalarda mahsulotlarini namoyish
              etib sotish imkoniga ega.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-24 mb-10 px-4">
        <h2 className="text-2xl md:text-3xl font-medium text-[var(--text-main)] mb-8">Kasb yo'nalishlari</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <StaticSkeleton key={i} />)
            : staticCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || FaQuestion;
                return (
                  <Link key={cat.id} to={`/${encodeURIComponent(cat.name)}`}>
                    <div className="border border-base-300 shadow hover:shadow-md transition-shadow duration-300 flex flex-col gap-2 p-4 bg-[var(--bg-card)] rounded-lg">
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

      <div className="max-w-6xl mx-auto mt-20 mb-24 px-4" id="yarmarka">
        <h2 className="text-2xl md:text-3xl font-medium text-[var(--text-main)] mb-8">Yarmarka</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <DynamicSkeleton key={i} />)
            : dynamicCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || FaQuestion;
                return (
                  <Link key={cat.id} to={`/category/${encodeURIComponent(cat.name)}`}>
                    <div className="border border-base-300 shadow hover:shadow-md transition-shadow flex gap-4 p-4 sm:p-5 bg-[var(--bg-card)] rounded-lg">
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
    </div>
  );
}
