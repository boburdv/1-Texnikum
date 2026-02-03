import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabase";
import { TrashIcon } from "@heroicons/react/24/outline";

const BUCKET = "staff-photos";

export default function StaffAdmin({ showToast }) {
  const deleteModalRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");
  const [image, setImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const toastOk = useCallback((m) => showToast?.(m, "success"), [showToast]);
  const toastErr = useCallback((m) => showToast?.(m, "error"), [showToast]);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setOrderIndex("0");
    setImage(null);
  }, []);

  const getPublicPhotoUrl = useCallback((photo_path) => {
    if (!photo_path) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo_path);
    return data?.publicUrl || null;
  }, []);

  const fetchStaff = useCallback(async () => {
    setLoadingList(true);

    const { data, error } = await supabase.from("staff").select("id,name,description,photo_path,order_index,is_active").order("order_index", { ascending: true });

    if (error) toastErr("Xodimlar yuklanmadi!");
    if (data) setItems(data);

    setLoadingList(false);
  }, [toastErr]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((x) => {
      const n = (x.name || "").toLowerCase();
      const d = (x.description || "").toLowerCase();
      return n.includes(q) || d.includes(q);
    });
  }, [items, query]);

  const uploadPhotoIfNeeded = useCallback(async () => {
    if (!image) return null;

    const ext = image.name.split(".").pop() || "jpg";
    const fileName = `staff/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, image, { upsert: true });

    if (error) throw new Error("Rasm yuklanmadi");

    return fileName;
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toastErr("Ismni kiriting!");

    setSaving(true);
    try {
      const photo_path = image ? await uploadPhotoIfNeeded() : null;

      const payload = {
        name: name.trim(),
        description: description?.trim() || null,
        order_index: Number(orderIndex || 0),
        is_active: true,
        ...(photo_path ? { photo_path } : {}),
      };

      const { data, error } = await supabase.from("staff").insert([payload]).select();
      if (error) throw error;

      if (data?.[0]) {
        setItems((prev) => [...prev, data[0]].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
      }

      toastOk("Xodim qo‘shildi");
      resetForm();
    } catch (err) {
      toastErr(err?.message || "Saqlashda xatolik!");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = useCallback((row) => {
    setToDelete(row);
    deleteModalRef.current?.showModal();
  }, []);

  const doDelete = useCallback(async () => {
    if (!toDelete) return;

    const id = toDelete.id;

    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return toastErr("O‘chirishda xatolik!");

    if (toDelete.photo_path) {
      await supabase.storage.from(BUCKET).remove([toDelete.photo_path]);
    }

    setItems((prev) => prev.filter((x) => x.id !== id));
    toastOk("Xodim o‘chirildi");
    setToDelete(null);
  }, [toDelete, toastErr, toastOk]);

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="flex-1 max-w-xl bg-base-100 shadow card p-6 flex flex-col">
        <h2 className="card-title mb-4 text-center">Xodim qo‘shish</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" placeholder="Ism familiya" className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />

          <textarea placeholder="Tavsif (lavozim / qisqa izoh)" className="textarea w-full" value={description} onChange={(e) => setDescription(e.target.value)} />

          <input type="file" className="file-input w-full" onChange={(e) => setImage(e.target.files?.[0] || null)} />

          <input type="number" placeholder="Tartib (0,1,2...)" className="input w-full" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />

          <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2" disabled={saving}>
            {saving && <span className="loading loading-spinner"></span>}
            Qo‘shish
          </button>
        </form>
      </div>

      <div className="flex-1 sm:flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <input type="text" className="input grow" placeholder="Ism yoki tavsif bo‘yicha qidirish..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="overflow-y-auto h-[448px] space-y-4 p-0.5 pr-1.5">
          {loadingList ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-base-100 shadow rounded-lg p-4 flex justify-between items-center animate-pulse">
                <div className="pr-4 w-full">
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((row) => {
              const img = getPublicPhotoUrl(row.photo_path);

              return (
                <div key={row.id} className="bg-base-100 shadow transition-shadow duration-300 hover:shadow-md rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{row.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{row.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button className="btn btn-circle btn-ghost" onClick={() => confirmDelete(row)} title="O‘chirish">
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center opacity-60 p-6">Hozircha xodim yo‘q</div>
          )}
        </div>
      </div>

      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Rostdan o‘chirmoqchimisiz?</h3>
          <p className="py-4">Bu amalni qaytarib bo‘lmaydi.</p>
          <div className="modal-action">
            <button className="btn" onClick={() => deleteModalRef.current?.close()}>
              Bekor qilish
            </button>

            <button
              className="btn btn-error"
              onClick={async () => {
                await doDelete();
                deleteModalRef.current?.close();
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
