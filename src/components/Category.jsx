import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AdDetail() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("ads")
      .select("*")
      .eq("id", adId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setAd(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!ad) return <p className="text-center mt-20">E'lon topilmadi.</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 lg:mt-4 flex flex-col md:flex-row gap-8">
      {ad.image_url && <img src={ad.image_url} alt={ad.title} className="w-full md:w-1/2 h-[300px] md:h-[400px] lg:h-[450px] object-cover rounded-md shadow" />}

      <div className="md:w-1/2 w-full flex flex-col justify-start">
        <h2 className="text-3xl font-bold mb-4">{ad.title}</h2>
        <p className="text-gray-700 mb-4">{ad.description}</p>

        {ad.price && <p className="text-green-600 font-semibold mb-2">{ad.price} so‘m</p>}

        <p className="mb-1">
          <strong>Kategoriya:</strong> {ad.category}
        </p>
        <p className="mb-1">
          <strong>Subkategoriya:</strong> {ad.sub_category}
        </p>
        {ad.created_at && (
          <p className="text-gray-500 text-sm mt-2">
            <strong>Yaratilgan sana:</strong> {new Date(ad.created_at).toLocaleString()}
          </p>
        )}

        <button onClick={() => navigate(`/chat?category=${encodeURIComponent(ad.category)}`)} className="btn btn-primary mt-6 w-full md:w-1/2">
          Izoh qoldirish
        </button>
      </div>
    </div>
  );
}
