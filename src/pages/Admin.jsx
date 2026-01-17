import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import StudentsAdmin from "../components/StudentsAdmin";
import { toast } from "react-hot-toast";

export default function AdminPanel() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const deleteModalRef = useRef(null);

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
  const [telegram, setTelegram] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ads");
  const [adToDelete, setAdToDelete] = useState(null);

  const ADMIN_EMAIL = "admin@admin.uz";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== ADMIN_EMAIL) return navigate("/auth", { replace: true });
      setUser(user);
      setLoadingUser(false);
    });
  }, [navigate]);

  useEffect(() => {
    const fetch = async () => {
      const { data: cats } = await supabase.from("dynamic").select("*");
      if (cats) setCategories(cats);
      const { data: adsData } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
      if (adsData) setAds(adsData.filter((ad) => ad?.title));
    };
    fetch();
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

  const showToast = (msg, type = "success") => {
    if (type === "success") toast.success(msg);
    else toast.error(msg);
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!title || !description || !category || !subCategory || !price) {
      showToast("Barcha maydonlarni to‘ldiring!", "error");
      setLoading(false);
      return;
    }

    let image_url = null;
    if (image) {
      const ext = image.name.split(".").pop();
      const path = `ads/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("ads").upload(path, image, { upsert: true });
      if (uploadError) {
        showToast("Rasm yuklanmadi!", "error");
        setLoading(false);
        return;
      }
      image_url = supabase.storage.from("ads").getPublicUrl(path).data.publicUrl;
    }

    let telegramValue = telegram.trim();
    if (telegramValue) {
      if (/^\d+$/.test(telegramValue)) telegramValue = `https://t.me/${telegramValue}`;
      else if (!telegramValue.startsWith("https://t.me/")) telegramValue = `https://t.me/${telegramValue.replace("@", "")}`;
    }

    if (editingId) {
      const { data: updated } = await supabase
        .from("ads")
        .update({ title, description, price, category, sub_category: subCategory, telegram: telegramValue, ...(image_url && { image_url }) })
        .eq("id", editingId)
        .select();
      if (updated?.[0]) setAds((prev) => prev.map((ad) => (ad.id === editingId ? updated[0] : ad)));
      setEditingId(null);
      showToast("E’lon muvaffaqiyatli yangilandi!", "success");
    } else {
      const { data: newAds } = await supabase
        .from("ads")
        .insert([{ title, description, price, category, sub_category: subCategory, telegram: telegramValue, image_url, created_at: new Date() }])
        .select();
      if (newAds?.[0]) setAds((prev) => [newAds[0], ...prev]);
      showToast("E’lon muvaffaqiyatli qo‘shildi!", "success");
    }

    setLoading(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setTelegram("");
    setCategory("");
    setSubCategory("");
    setImage(null);
  };

  const handleDeleteAd = async (id) => {
    await supabase.from("ads").delete().eq("id", id);
    setAds((prev) => prev.filter((ad) => ad.id !== id));
    showToast("E’lon muvaffaqiyatli o‘chirildi", "error");
  };

  const confirmDeleteAd = (ad) => {
    setAdToDelete(ad);
    deleteModalRef.current.showModal();
  };

  const handleEditAd = (ad) => {
    if (!ad) return;
    setEditingId(ad.id);
    setTitle(ad.title || "");
    setDescription(ad.description || "");
    setPrice(ad.price || "");
    setTelegram(ad.telegram || "");
    setCategory(ad.category || "");
    setSubCategory(ad.sub_category || "");
  };

  const filteredAds = ads.filter((ad) => ad?.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loadingUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    );
  if (!user) return null;

  return (
    <div className="bg-base-200 min-h-screen flex items-start justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col gap-5">
        <div className="join mx-auto">
          <button className={`join-item btn ${activeTab === "ads" ? "btn-primary" : "btn-active"}`} onClick={() => setActiveTab("ads")}>
            E’lonlar
          </button>
          <button className={`join-item btn ${activeTab === "students" ? "btn-primary" : "btn-active"}`} onClick={() => setActiveTab("students")}>
            Statistika
          </button>
        </div>

        {activeTab === "ads" && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 max-w-xl bg-base-100 shadow card p-6 flex flex-col">
              <h2 className="card-title mb-4 text-center">{editingId ? "E'lonni tahrirlash" : "E'lon qo'shish"}</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSubmitAd}>
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
                <input type="text" placeholder="E’lon nomi" className="input w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea placeholder="E'lon bo'yicha batafsil" className="textarea w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="file" className="file-input w-full" onChange={(e) => setImage(e.target.files[0])} />
                <div className="flex gap-2">
                  <input type="text" placeholder="Telegram @user/+998" className="input flex-1" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
                  <input type="text" placeholder="Narx/100 000" className="input flex-1" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <span className="loading loading-spinner"></span>}
                  {editingId ? "Yangilash" : "Qo'shish"}
                </button>
              </form>
            </div>

            <div className="flex-1 sm:flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <input
                  ref={searchRef}
                  type="text"
                  className="input grow"
                  placeholder="E’lon nomi yoki tavsif bo‘yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd className="kbd kbd-sm">⌘</kbd>
                <kbd className="kbd kbd-sm">K</kbd>
              </div>
              <div className="overflow-y-auto h-[448px] space-y-4 p-0.5 pr-1.5">
                {filteredAds.length > 0
                  ? filteredAds.map((ad) => (
                      <div key={ad.id} className="bg-base-100 shadow transition-shadow duration-300 hover:shadow-md rounded-lg p-4 flex justify-between items-center">
                        <div className="pr-2">
                          <h3 className="font-bold">{ad.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{ad.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-circle btn-ghost" onClick={() => handleEditAd(ad)}>
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button className="btn btn-circle btn-ghost" onClick={() => confirmDeleteAd(ad)}>
                            <TrashIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  : Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="bg-base-100 shadow rounded-lg p-4 flex justify-between items-center animate-pulse">
                        <div className="pr-4 w-full">
                          <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && <StudentsAdmin showToast={showToast} />}
      </div>

      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Rostdan o‘chirmoqchimisiz?</h3>
          <p className="py-4">Bu amalni qaytarib bo‘lmaydi.</p>
          <div className="modal-action">
            <button className="btn" onClick={() => deleteModalRef.current.close()}>
              Bekor qilish
            </button>
            <button
              className="btn btn-error"
              onClick={() => {
                if (adToDelete) handleDeleteAd(adToDelete.id);
                deleteModalRef.current.close();
              }}
            >
              <TrashIcon className="w-5 h-5" />
              O‘chirish
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
