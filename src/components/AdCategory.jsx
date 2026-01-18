import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabase";
import { TrashIcon } from "@heroicons/react/24/outline";

const LS_KEY = "favorites_ads";

export default function CategoryAds() {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);

  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [allFavorites, setAllFavorites] = useState([]);

  const saveFavorites = (ids) => {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
    setFavorites(ids);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: catData } = await supabase.from("dynamic").select("*").ilike("name", decodedCategory);
      if (!catData?.length) {
        setLoading(false);
        return;
      }
      const current = catData[0];
      setCategory(current);
      setSubCategories(current.sub || []);
      const { data: adsData } = await supabase.from("ads").select("*").eq("category", decodedCategory);
      setAds(adsData || []);
      setLoading(false);
    };
    loadData();
  }, [decodedCategory]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    setFavorites(stored);
    if (stored.length) {
      supabase
        .from("ads")
        .select("*")
        .in("id", stored)
        .then(({ data }) => setAllFavorites(data || []));
    }
  }, []);

  const toggleFavorite = async (adId) => {
    if (favorites.includes(adId)) {
      const updated = favorites.filter((id) => id !== adId);
      saveFavorites(updated);
      setAllFavorites((prev) => prev.filter((ad) => ad.id !== adId));
    } else {
      const updated = [...favorites, adId];
      saveFavorites(updated);
      const { data } = await supabase.from("ads").select("*").eq("id", adId).single();
      if (data) setAllFavorites((prev) => [...prev, data]);
    }
  };

  const removeFavorite = (adId) => {
    const updated = favorites.filter((id) => id !== adId);
    saveFavorites(updated);
    setAllFavorites((prev) => prev.filter((ad) => ad.id !== adId));
  };

  const filteredAds = selectedSub ? ads.filter((ad) => ad.sub_category?.toLowerCase() === selectedSub.toLowerCase()) : ads;

  const SkeletonCard = () => (
    <div className="shadow rounded-lg overflow-hidden">
      <figure className="relative aspect-[3/3.5]">
        <div className="bg-base-100 w-full h-full" />
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full skeleton" />
      </figure>
      <div className="px-3 lg:px-4 py-4 bg-base-100">
        <div className="skeleton h-4 w-4/5 rounded mb-1" />
        <div className="skeleton h-4 w-2/5 rounded" />
      </div>
    </div>
  );

  const skeletonCards = Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />);

  return (
    <>
      <div className="sticky top-0 z-30 bg-white mb-4 shadow-xs">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          {loading ? (
            <div className="w-full">
              <div className="skeleton h-7 w-64 rounded mb-2" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-9.5 w-24 rounded-sm" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-[20px] font-medium line-clamp-1" style={{ color: "var(--text-main)" }}>
                {category.name} bo'yicha e'lonlar
              </h2>

              <div className="dropdown dropdown-end">
                <button className="btn btn-sm btn-ghost btn-circle">
                  <svg viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" fill="none" className="size-5">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
                <ul className="dropdown-content menu p-2 w-80 shadow bg-base-100 border border-base-300 rounded-box">
                  {allFavorites.length === 0 ? (
                    <li className="text-gray-400 py-1 text-center">Hech qanday saralanganlar yo'q</li>
                  ) : (
                    allFavorites.map((ad) => (
                      <li key={ad.id} className="border-b border-base-200">
                        <div className="flex items-center gap-2">
                          <Link to={`/ad/${ad.id}`} className="flex items-center gap-2 flex-1">
                            <img src={ad.image_url} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <span className="font-medium line-clamp-1">{ad.title}</span>
                              {ad.price && <span className="text-sm text-primary">{ad.price}</span>}
                            </div>
                          </Link>
                          <button onClick={() => removeFavorite(ad.id)} className="btn btn-circle btn-sm btn-ghost text-error">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        {!loading && subCategories.length > 0 && (
          <div className="relative container mx-auto px-4">
            <div className="overflow-hidden">
              <div className="flex gap-2 py-1 overflow-x-auto scroll-hidden">
                <button onClick={() => setSelectedSub("")} className={`btn h-9 btn-soft ${selectedSub === "" ? "btn-primary" : ""}`}>
                  Barchasi
                </button>
                {subCategories.map((sub, i) => (
                  <button key={i} onClick={() => setSelectedSub(sub)} className={`btn h-9 btn-soft ${selectedSub === sub ? "btn-primary" : ""}`}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{skeletonCards}</div>
        ) : filteredAds.length === 0 ? (
          <div className="mt-60">
            <p className="text-center text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
              Hozircha joylangan e'lonlar mavjud emas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAds.map((ad) => (
              <Link key={ad.id} to={`/ad/${ad.id}`}>
                <div className="shadow rounded-lg bg-base-100 overflow-hidden transition-all hover:shadow-md">
                  <figure className="relative aspect-[3/3.5]">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(ad.id);
                      }}
                      className="btn btn-circle btn-sm absolute top-2 right-2 bg-white/70 backdrop-blur"
                    >
                      <svg fill={favorites.includes(ad.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-[1.2em]">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>
                    {ad.sub_category && <span className="badge badge-ghost badge-sm absolute top-2 left-2 bg-white/70 backdrop-blur">{ad.sub_category}</span>}
                    <img src={ad.image_url} className="w-full h-full object-cover" />
                  </figure>
                  <div className="shadow overflow-hidden">
                    <div className="px-3 lg:px-4 py-2">
                      <h2 className="font-medium line-clamp-1">{ad.title}</h2>
                      {ad.price && <p className="font-semibold line-clamp-1 py-0.5">{ad.price} so'm</p>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
