import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabase";
import { UserIcon } from "@heroicons/react/16/solid";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function CategoryAds() {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);

  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [favorites, setFavorites] = useState([]); // faqat IDlar
  const [allFavorites, setAllFavorites] = useState([]); // butun adlar

  /* ================= AUTH ================= */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => supabase.auth.signOut();

  /* ================= CATEGORY + ADS ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: catData, error: catError } = await supabase.from("dynamic").select("*").ilike("name", decodedCategory);

      if (catError || !catData?.length) {
        console.error(catError);
        setLoading(false);
        return;
      }

      const current = catData[0];
      setCategory(current);
      setSubCategories(current.sub || []);

      const { data: adsData, error: adsError } = await supabase.from("ads").select("*").eq("category", decodedCategory);

      if (adsError) console.error(adsError);
      setAds(adsData || []);
      setLoading(false);
    };

    loadData();
  }, [decodedCategory]);

  /* ================= FAVORITES ================= */
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setAllFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      const { data: favData, error: favError } = await supabase.from("favorites").select("ad_id").eq("user_id", user.id);

      if (favError) return console.error(favError);

      const favIds = favData.map((f) => f.ad_id);
      setFavorites(favIds);

      if (favIds.length === 0) {
        setAllFavorites([]);
        return;
      }

      const { data: adsData, error: adsError } = await supabase.from("ads").select("*").in("id", favIds);

      if (adsError) return console.error(adsError);
      setAllFavorites(adsData || []);
    };

    fetchFavorites();
  }, [user]);

  /* ================= FAVORITE TOGGLE ================= */
  const toggleFavorite = async (adId) => {
    if (!user) return alert("Login qilishingiz kerak!");

    if (favorites.includes(adId)) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("ad_id", adId);

      if (!error) {
        setFavorites((prev) => prev.filter((id) => id !== adId));
        setAllFavorites((prev) => prev.filter((ad) => ad.id !== adId));
      }
    } else {
      const { error } = await supabase.from("favorites").insert([{ user_id: user.id, ad_id: adId }]);

      if (!error) {
        setFavorites((prev) => [...prev, adId]);
        const { data: adData } = await supabase.from("ads").select("*").eq("id", adId).single();
        if (adData) setAllFavorites((prev) => [...prev, adData]);
      }
    }
  };

  const removeFavorite = async (adId) => {
    if (!user) return;

    const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("ad_id", adId);

    if (!error) {
      setFavorites((prev) => prev.filter((id) => id !== adId));
      setAllFavorites((prev) => prev.filter((ad) => ad.id !== adId));
    }
  };

  const filteredAds = selectedSub ? ads.filter((ad) => ad.sub_category?.toLowerCase() === selectedSub.toLowerCase()) : ads;

  const skeletonCards = Array.from({ length: 10 }, (_, i) => <div key={i} className="bg-gray-200 animate-pulse aspect-[3/4.4] rounded-lg" />);

  return (
    <>
      <div className="sticky top-0 z-30 bg-white mb-4 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between">
          {loading ? (
            <div className="w-full animate-pulse">
              <div className="h-7 w-64 bg-gray-200 rounded mb-2" />
              <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9.5 w-24 bg-gray-200 rounded-sm" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-[20px] font-medium text-gray-600 line-clamp-1">{category.name} bo'yicha e'lonlar</h2>
              <div className="flex gap-4 items-center">
                <div className="flex gap-3 items-center">
                  {/* FAVORITES BUTTON */}
                  {user && (
                    <div className="dropdown dropdown-end">
                      <button className="btn btn-sm btn-ghost btn-circle">
                        <svg viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" fill="none" className="size-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-700"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </button>
                      <ul className="dropdown-content menu p-2 w-80 shadow bg-base-100 rounded-box">
                        {allFavorites.length === 0 ? (
                          <li className="text-gray-400 py-1 text-center">Hech qanday saralanganlar yo'q</li>
                        ) : (
                          allFavorites.map((ad) => (
                            <li key={ad.id}>
                              <div className="flex items-center gap-2 border-b last:border-b-0">
                                <Link to={`/ad/${ad.id}`} className="flex items-center gap-2 flex-1">
                                  <img src={ad.image_url} className="w-12 h-12 object-cover rounded" />
                                  <div>
                                    <span className="font-medium line-clamp-1">{ad.title}</span>
                                    {ad.price && <span className="text-sm text-primary">{ad.price}</span>}
                                  </div>
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeFavorite(ad.id);
                                  }}
                                  className="btn btn-circle btn-sm btn-ghost text-error"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}

                  {/* USER ICON */}
                  {!user ? (
                    <Link to="/auth" className="btn btn-primary btn-sm gap-1">
                      Kirish <UserIcon className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="dropdown dropdown-end">
                      <button className="rounded-full overflow-hidden">
                        <div className="bg-primary text-white w-8 h-8 flex items-center justify-center">{user.user_metadata?.full_name?.[0]?.toUpperCase() ?? "U"}</div>
                      </button>
                      <ul className="dropdown-content menu bg-base-100 rounded-box w-52 shadow mt-3 p-2">
                        <li>
                          <span>Ism: {user.user_metadata?.full_name}</span>
                        </li>
                        <li>
                          <Link to="/admin">Admin panel</Link>
                        </li>
                        <li>
                          <button onClick={handleLogout}>Hisobdan chiqish</button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && subCategories.length > 0 && (
          <div className="relative max-w-6xl mx-auto px-4">
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

      <div className="max-w-6xl mx-auto px-4 mb-24">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">{skeletonCards}</div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-24">Hozircha joylangan e'lonlar topilmadi</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
            {filteredAds.map((ad) => (
              <Link key={ad.id} to={`/ad/${ad.id}`}>
                <div className="border border-base-300 bg-base-100 rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <figure className="relative aspect-[3/3.5] bg-gray-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(ad.id);
                      }}
                      className="btn btn-circle btn-sm absolute top-2 right-2 bg-white/70 hover:bg-white"
                    >
                      <svg fill={favorites.includes(ad.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="size-[1.2em]">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  </figure>
                  <div className="px-4 py-2">
                    <h2 className="text-base font-medium line-clamp-1">{ad.title}</h2>
                    {ad.price && <p className="font-semibold text-primary line-clamp-1">{ad.price}</p>}
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
