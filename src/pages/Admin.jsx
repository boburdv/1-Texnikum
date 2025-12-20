import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminPanel() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const ADMIN_EMAIL = "admin@admin.uz";
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) return navigate("/auth", { replace: true });
      setUser(user);
      setLoadingUser(false);
    });
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cats } = await supabase.from("categories").select("*");
      if (cats) setCategories(cats);

      const { data: adsData } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
      if (adsData) setAds(adsData.filter((ad) => ad?.title));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!title || !description || !category || !subCategory || !price) {
      setMessage("Barcha maydonlarni to‘ldiring!");
      setLoading(false);
      return;
    }

    let image_url = null;
    if (image) {
      const fileExt = image.name.split(".").pop();
      const filePath = `ads/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("ads").upload(filePath, image, { upsert: true });
      if (uploadError) return setMessage("Rasm yuklanmadi!"), setLoading(false);
      const { data: urlData } = supabase.storage.from("ads").getPublicUrl(filePath);
      image_url = urlData.publicUrl;
    }

    if (editingId) {
      const { data: updated, error } = await supabase
        .from("ads")
        .update({
          title,
          description,
          price,
          category,
          sub_category: subCategory,
          ...(image_url && { image_url }),
        })
        .eq("id", editingId)
        .select();
      if (!error && updated?.[0]) setAds((prev) => prev.map((ad) => (ad.id === editingId ? updated[0] : ad)));
      setEditingId(null);
      setMessage("E’lon yangilandi!");
    } else {
      const { data: newAds, error } = await supabase
        .from("ads")
        .insert([
          {
            title,
            description,
            price,
            category,
            sub_category: subCategory,
            image_url,
            created_at: new Date(),
          },
        ])
        .select();
      if (!error && newAds?.[0]) setAds((prev) => [newAds[0], ...prev]);
      setMessage("E’lon qo‘shildi!");
    }

    setLoading(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setSubCategory("");
    setImage(null);

    const { data: adsData } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
    if (adsData) setAds(adsData.filter((ad) => ad?.title));
  };

  const handleDelete = async (id) => {
    await supabase.from("ads").delete().eq("id", id);
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  const handleEdit = (ad) => {
    if (!ad) return;
    setEditingId(ad.id);
    setTitle(ad.title || "");
    setDescription(ad.description || "");
    setPrice(ad.price || "");
    setCategory(ad.category || "");
    setSubCategory(ad.sub_category || "");
  };

  const filteredAds = ads.filter((ad) => ad?.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loadingUser) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="bg-base-200 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full flex gap-10 items-start">
        <div className="flex-1 max-w-xl bg-base-100 shadow-xl card p-6 flex flex-col justify-center">
          <h2 className="card-title mb-4 text-center">{editingId ? "E'lonni tahrirlash" : "E'lon qo'shish"}</h2>
          {message && <p className="text-green-600 text-center mb-3">{message}</p>}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="E’lon nomi" className="input w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Tafsifi" className="textarea w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="number" placeholder="Narxi" className="input w-full" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input type="file" className="file-input w-full" onChange={(e) => setImage(e.target.files[0])} />

            <select
              className="select w-full"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory("");
              }}
            >
              <option value="">Kategoriya tanlang</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select className="select w-full" value={subCategory} disabled={!category} onChange={(e) => setSubCategory(e.target.value)}>
              <option value="">Subkategoriya tanlang</option>
              {category &&
                categories
                  .find((cat) => cat.name === category)
                  ?.sub?.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
            </select>

            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
              {loading && <span className="loading loading-spinner"></span>}
              {editingId ? "Yangilash" : "Qo'shish"}
            </button>
          </form>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-5">
            <input ref={searchRef} type="text" className="input grow" placeholder="E’lon nomi bo‘yicha qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <kbd className="kbd kbd-sm">⌘</kbd>
            <kbd className="kbd kbd-sm">K</kbd>
          </div>

          <div className="overflow-y-auto h-[448px] space-y-4 p-0.5 pr-1.5">
            {filteredAds.length > 0
              ? filteredAds.map((ad) => (
                  <div key={ad.id} className="bg-base-100 shadow rounded-lg p-4 flex justify-between items-center">
                    <div className="pr-2">
                      <h3 className="font-bold">{ad.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{ad.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded" onClick={() => handleEdit(ad)}>
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded" onClick={() => handleDelete(ad.id)}>
                        <TrashIcon className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              : Array.from({ length: 5 }).map((i) => (
                  <div key={i} className="bg-base-100 shadow rounded-lg p-4 flex justify-between items-center animate-pulse">
                    <div className="pr-4 w-full">
                      <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
