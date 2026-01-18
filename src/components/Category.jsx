import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { MdArrowBackIos } from "react-icons/md";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [category, setCategory] = useState(null);
  const [students, setStudents] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: categoryData } = await supabase.from("static").select("id, name, description, image_url, students").ilike("name", `%${categoryName}%`).maybeSingle();
        if (!categoryData) {
          setCategory(null);
          setStudents([]);
          return;
        }
        setCategory(categoryData);
        setStudents(categoryData.students || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-7xl font-bold text-blue-800">404</h1>
          <p className="text-xl text-gray-500">Sahifa topilmadi</p>
          <a href="/" className="btn btn-primary">
            <MdArrowBackIos /> Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:mt-24">
      <div className="md:flex gap-8 w-full">
        <div className="md:w-1/2 w-full aspect-[3/2] overflow-hidden relative rounded-md bg-gray-200">
          {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-300" />}
          <img
            src={category.image_url || "/no-image.webp"}
            alt={category.name}
            className={`w-full h-full object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="md:w-1/2 w-full mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
          <div className={`text-gray-700 whitespace-pre-line overflow-hidden ${showFullDescription ? "" : "line-clamp-5"}`}>{category.description}</div>
          {category.description?.length > 100 && (
            <button className="mt-2 text-blue-600 text-sm cursor-pointer hover:underline" onClick={() => setShowFullDescription(!showFullDescription)}>
              {showFullDescription ? "Kamroq o'qish" : "Ko'proq o'qish"}
            </button>
          )}
        </div>
      </div>

      {students.length > 0 && (
        <div className="my-24">
          <h2 className="text-2xl md:text-3xl font-medium text-[var(--text-main)] mb-8">{category.name} yo'nalishida</h2>
          <div className="max-h-[400px] overflow-y-auto overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-base-200 z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Ism</th>
                  <th className="px-4 py-3 font-semibold">Familiya</th>
                  <th className="px-4 py-3 font-semibold">Bosqich</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((s, i) => (
                  <tr key={i} className="hover:bg-base-200 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{s.first_name}</td>
                    <td className="px-4 py-3">{s.last_name}</td>
                    <td className="px-4 py-3">{s.group_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
