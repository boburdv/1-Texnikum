import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const redirect = new URLSearchParams(useLocation().search).get("redirect") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !displayName)) {
      toast.error("Barcha maydonlarni to‘ldiring");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Email yoki parol noto‘g‘ri");
          return;
        }

        toast.success("Hisobga kirish muvaffaqiyatli");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
          },
        });

        if (error) {
          toast.error("Ro‘yxatdan o‘tishda xatolik");
          return;
        }

        toast.success("Ro‘yxatdan o‘tish muvaffaqiyatli");
      }

      navigate(redirect);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-base-200">
      <div className="card w-full max-w-96 bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">{isLogin ? "Kirish" : "Ro‘yxatdan o‘tish"}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <label className="input  w-full">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </g>
                </svg>
                <input className="flex-1 w-full" type="text" placeholder="To'liq ism" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </label>
            )}

            <label className="input  w-full">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <input className="flex-1 w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="input  w-full">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                />
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
              <input className="flex-1 w-full" type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} minLength={4} />
            </label>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading && <span className="loading loading-spinner"></span>}
              {isLogin ? "Kirish" : "Ro‘yxatdan o‘tish"}
            </button>
          </form>

          <button onClick={handleGoogleSignIn} disabled={googleLoading} className="btn w-full mt-2 bg-white text-black border flex items-center justify-center gap-2">
            {googleLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <svg aria-label="Google logo" width="18" height="18" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M0 0h512v512H0z" />
                <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
                <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
                <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
                <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
              </svg>
            )}
            <span>Google bilan kirish</span>
          </button>

          <p className="mt-4 text-center text-sm text-blue-600 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Yangi hisob yaratish" : "Allaqachon hisobingiz bormi?"}
          </p>
        </div>
      </div>
    </div>
  );
}
