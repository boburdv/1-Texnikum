import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function NewsAdmin() {
  const searchRef = useRef(null);
  const deleteModalRef = useRef(null);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newsToDelete, setNewsToDelete] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!description) {
      toast.error("Matnni kiriting");
      setSaving(false);
      return;
    }

    let image_url = null;
    if (image) {
      const ext = image.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("news-image").upload(fileName, image, { upsert: true });
      if (error) {
        toast.error("Rasm yuklanmadi");
        setSaving(false);
        return;
      }
      image_url = supabase.storage.from("news-image").getPublicUrl(fileName).data.publicUrl;
    }

    if (editingId) {
      const { data } = await supabase
        .from("news")
        .update({
          description,
          ...(image_url && { image_url }),
        })
        .eq("id", editingId)
        .select();

      if (data?.[0]) {
        setNews((prev) => prev.map((n) => (n.id === editingId ? data[0] : n)));
      }
      setEditingId(null);
      toast.success("Yangilik yangilandi");
    } else {
      const { data } = await supabase.from("news").insert([{ description, image_url }]).select();

      if (data?.[0]) setNews((prev) => [data[0], ...prev]);
      toast.success("Yangilik qo‘shildi");
    }

    setDescription("");
    setImage(null);
    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setDescription(item.description);
  };

  const confirmDelete = (item) => {
    setNewsToDelete(item);
    deleteModalRef.current.showModal();
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    await supabase.from("news").delete().eq("id", newsToDelete.id);
    setNews((prev) => prev.filter((n) => n.id !== newsToDelete.id));

    setNewsToDelete(null);
    deleteModalRef.current.close();
    toast.error("Yangilik o‘chirildi");
  };

  const filteredNews = news.filter((n) => n.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="flex-1 max-w-xl bg-base-100 shadow card p-6">
        <h2 className="card-title mb-4 text-center">{editingId ? "Yangilikni tahrirlash" : "Yangilik qo‘shish"}</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <textarea placeholder="Yangilik matni, maksimal 3 qator" className="textarea w-full min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} />

          <input type="file" className="file-input w-full" onChange={(e) => setImage(e.target.files[0])} />

          <button className="btn btn-primary w-full">
            {saving && <span className="loading loading-spinner"></span>}
            {editingId ? "Yangilash" : "Qo‘shish"}
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <input ref={searchRef} type="text" className="input grow" placeholder="Yangilik bo‘yicha qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <kbd className="kbd kbd-sm">⌘</kbd>
          <kbd className="kbd kbd-sm">K</kbd>
        </div>

        <div className="overflow-y-auto h-[448px] space-y-4 p-0.5 pr-1.5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-base-100 shadow rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              ))
            : filteredNews.map((item) => (
                <div key={item.id} className="bg-base-100 shadow transition-shadow hover:shadow-md rounded-lg p-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600 line-clamp-2 pr-2">{item.description}</p>

                  <div className="flex gap-2">
                    <button className="btn btn-circle btn-ghost" onClick={() => handleEdit(item)}>
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button className="btn btn-circle btn-ghost" onClick={() => confirmDelete(item)}>
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Rostdan o‘chirmoqchimisiz?</h3>
          <p className="py-4">Bu amalni qaytarib bo‘lmaydi.</p>
          <div className="modal-action">
            <button className="btn" onClick={() => deleteModalRef.current.close()}>
              Bekor qilish
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              <TrashIcon className="w-5 h-5" />
              O‘chirish
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
