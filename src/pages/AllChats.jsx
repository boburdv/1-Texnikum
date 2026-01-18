import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PencilIcon, TrashIcon } from "@heroicons/react/16/solid";

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const categoryFromURL = new URLSearchParams(location.search).get("category");

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const currentUserId = user?.email;

  const fetchChats = useCallback(async () => {
    const { data: allChats } = await supabase.from("chats").select("*");
    let all = allChats || [];

    if (categoryFromURL) {
      const chatId = `category-${categoryFromURL}`;
      if (!all.find((c) => c.id === chatId)) {
        const { data } = await supabase
          .from("chats")
          .insert([{ id: chatId, messages: [] }])
          .select()
          .single();
        all.push(data);
      }
      setSelectedChatId(chatId);
    }
    setChats(all);
  }, [categoryFromURL]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!selectedChatId) return;

    const channel = supabase
      .channel("public:chats")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chats", filter: `id=eq.${selectedChatId}` }, (payload) => setMessages(payload.new.messages || []))
      .subscribe();

    supabase
      .from("chats")
      .select("messages")
      .eq("id", selectedChatId)
      .single()
      .then(({ data }) => setMessages(data?.messages || []));

    return () => supabase.removeChannel(channel);
  }, [selectedChatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateChatMessages = useCallback(
    async (updated) => {
      await supabase.from("chats").update({ messages: updated }).eq("id", selectedChatId);
      setMessages(updated);
    },
    [selectedChatId]
  );

  const handleSend = async () => {
    if (!text.trim() || !selectedChatId) return;

    const trimmed = text.trim();
    let updated;

    if (editingIndex !== null) {
      updated = [...messages];
      updated[editingIndex] = { ...updated[editingIndex], text: trimmed, editedAt: Date.now() };
      setEditingIndex(null);
    } else {
      updated = [...messages, { sender: currentUserId, text: trimmed, createdAt: Date.now() }];
    }

    setText("");
    await updateChatMessages(updated);
  };

  const deleteMessage = async (index) => {
    const updated = messages.filter((_, i) => i !== index);
    await updateChatMessages(updated);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-center text-lg font-medium text-gray-800">
          Avval ro'yxatdan o'tishingiz kerak.{" "}
          <a href="/auth" className="text-blue-600 hover:underline font-semibold">
            Login / Ro'yxatdan o'tish
          </a>
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      <div className="mx-auto max-w-xl w-full h-full lg:max-h-full max-h-full flex flex-col">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 shadow flex gap-2 justify-between items-center">
            <div className="flex items-center gap-3 flex-1">
              {selectedChatId ? (
                <>
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chats.find((c) => c.id === selectedChatId)?.id.replace("category-", ""))}&background=random`} alt="avatar" />
                  </div>
                  <span className="font-semibold text-lg">{chats.find((c) => c.id === selectedChatId)?.id.replace("category-", "")}</span>
                </>
              ) : (
                <span className="font-semibold text-lg">Kategoriya</span>
              )}
            </div>

            <select
              value={selectedChatId}
              onChange={(e) => {
                const chatId = e.target.value;
                setSelectedChatId(chatId);
                navigate(chatId ? `/chat?category=${encodeURIComponent(chatId.replace("category-", ""))}` : "/chat");
              }}
              className="select flex-1"
            >
              <option disabled>Kategoriya</option>
              {chats.map((chat) => (
                <option key={chat.id} value={chat.id}>
                  {chat.id.replace("category-", "")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
            {selectedChatId &&
              messages.map((msg, i) => {
                const isMe = msg.sender === currentUserId;
                const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <div key={i} className="chat chat-start relative">
                    {isMe && (
                      <div className="absolute right-0 top-4">
                        <div className="dropdown dropdown-left">
                          <div tabIndex={0} role="button" className="btn btn-circle btn-sm text-gray-600 btn-ghost">
                            <BsThreeDotsVertical size={20} />
                          </div>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                            <li>
                              <button
                                onClick={() => {
                                  setText(msg.text);
                                  setEditingIndex(i);
                                }}
                              >
                                <PencilIcon className="w-4 h-4" /> Tahrirlash
                              </button>
                            </li>
                            <li>
                              <button className="text-red-600" onClick={() => deleteMessage(i)}>
                                <TrashIcon className="w-4 h-4" /> O'chirish
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="chat-image avatar" title={msg.sender}>
                      <div className="w-10 rounded-full">
                        <img alt="avatar" src={`https://ui-avatars.com/api/?name=${msg.sender}&background=random`} />
                      </div>
                    </div>

                    <div className="chat-header flex items-center gap-2">
                      <time className="text-xs opacity-50">{time}</time>
                      {msg.editedAt && <span className="text-xs opacity-50 ml-1">(tahrirlandi)</span>}
                    </div>

                    <div className={`chat-bubble ${isMe ? "chat-bubble-primary" : ""}`}>{msg.text}</div>
                  </div>
                );
              })}
            <div ref={scrollRef}></div>
          </div>
        </div>

        {selectedChatId && (
          <div className="p-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Izoh qoldiring..."
              className="input input-bordered flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend} className="btn-primary btn">
              {editingIndex !== null ? "Yangilash" : "Yuborish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
