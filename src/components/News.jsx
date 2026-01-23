import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function News() {
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
      if (data) setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (!news.length) return;

    let timeout;

    const autoSlide = () => {
      setFade(false);
      timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % news.length);
        setFade(true);
      }, 300);
    };

    const interval = setInterval(() => {
      autoSlide();
    }, 7000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [news]);

  const next = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % news.length);
      setFade(true);
    }, 300);
  };

  const prev = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((i) => (i - 1 + news.length) % news.length);
      setFade(true);
    }, 300);
  };

  if (loading) {
    return (
      <div className="px-4 container mx-auto mt-[100px] relative w-full">
        <div className="bg-base-100 border border-base-300 w-full h-[450px] md:h-[500px] lg:h-[550px] rounded-b-lg" />
        <div className="absolute bottom-0 left-0 p-10 flex flex-col gap-3 w-full max-w-xl">
          <div className="skeleton h-4 w-5/5 rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-4 w-3/5 rounded" />
        </div>
        <div className="absolute left-10 top-1/2 -translate-y-1/2">
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
      </div>
    );
  }

  if (!news.length) return null;

  const item = news[index];

  return (
    <div className="relative px-4 w-full h-[450px] md:h-[500px] lg:h-[550px] mt-[100px] overflow-hidden rounded-b-lg container mx-auto">
      <div className="relative w-full h-full">
        <img
          key={item.id}
          src={item.image_url}
          alt="news"
          className={`w-full h-full object-cover rounded-b-lg transition-opacity duration-500 ease-in-out ${
            fade ? "opacity-100" : "opacity-0"
          } hover:scale-105 transition-transform duration-700 border border-base-300`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg transition-opacity duration-500 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
        <p className="text-base md:text-lg font-medium max-w-xl leading-relaxed">{item.description}</p>
      </div>

      <button onClick={prev} className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm btn btn-circle hover:scale-105 transition-transform duration-400">
        <FiChevronLeft size={22} />
      </button>
      <button onClick={next} className="absolute right-10 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm btn btn-circle hover:scale-105 transition-transform duration-400">
        <FiChevronRight size={22} />
      </button>
    </div>
  );
}
