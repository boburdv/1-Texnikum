import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => window.scrollTo({ top: 0 }), [categoryName]);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("static")
      .select("*")
      .ilike("name", categoryName)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setCategory(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryName]);

  const skeleton = (
    <div className="rounded-lg bg-base-100 md:flex overflow-hidden animate-pulse">
      <div className="md:w-1/2 w-full relative" style={{ paddingTop: "66.66%" }}>
        <div className="absolute inset-0 bg-gray-200"></div>
      </div>
      <div className="card-body md:w-1/2 gap-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-40 mb-24">
      {loading ? (
        skeleton
      ) : category ? (
        <div className="rounded-lg bg-base-100 shadow-sm md:flex overflow-hidden">
          <figure className="md:w-1/2 w-full relative" style={{ paddingTop: "66.66%" }}>
            <img src={category.image_url || "/no-image.webp"} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
          </figure>
          <div className="card-body md:w-1/2">
            <h2 className="card-title text-3xl font-bold">{category.name}</h2>
            <p className="text-gray-700 whitespace-pre-line">{category.description}</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-24">Ma’lumot topilmadi</p>
      )}
    </div>
  );
}
