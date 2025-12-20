import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClockIcon, EnvelopeIcon, PhoneIcon, UserIcon } from "@heroicons/react/16/solid";
import { FaInstagram } from "react-icons/fa";
import { SiTelegram } from "react-icons/si";
import { GrYoutube } from "react-icons/gr";
import { supabase } from "../supabase";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      setShowHeader(!(current > lastScroll && current > 80));
      lastScroll = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const socialLinks = [
    { icon: <SiTelegram className="w-4 h-4" />, href: "#" },
    { icon: <FaInstagram className="w-4 h-4" />, href: "#" },
    { icon: <GrYoutube className="w-4 h-4" />, href: "#" },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-base-100 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="bg-base-200 text-base-content border-b border-base-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center py-2 text-sm">
          <div className="flex gap-5">
            <a href="tel:+998901234567" className="flex items-center gap-1 hover:text-primary">
              <PhoneIcon className="w-4 h-4" /> (90) 123-4567
            </a>
            <a href="mailto:info@politex.uz" className="flex items-center gap-1 hover:text-primary">
              <EnvelopeIcon className="w-4 h-4" /> info@politex.uz
            </a>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <ClockIcon className="w-4 h-4" /> 8:00 - 18:00
            </div>
            {socialLinks.map((s, i) => (
              <a key={i} href={s.href} className="p-1 rounded-lg bg-white hover:bg-primary hover:text-white">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className="w-full shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center py-4">
          <Link to="/" className="text-[25px] font-semibold text-gray-700">
            POLITEXNIKUM
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary">
              Bosh sahifa
            </Link>
            <Link to="/about" className="hover:text-primary">
              Haqida
            </Link>
            <Link to="/" className="flex items-center gap-1 hover:text-primary">
              Yarmarka
            </Link>
            <Link to="/admin" className="hover:text-primary">
              Admin
            </Link>

            {!user ? (
              <Link to="/auth" className="btn btn-primary btn-sm gap-1">
                Kirish <UserIcon className="w-4 h-4" />
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="rounded-full overflow-hidden">
                  <div className="bg-primary text-white w-8 h-8 flex items-center justify-center">{user.user_metadata?.full_name?.[0]?.toUpperCase() ?? "U"}</div>
                </button>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box w-52 shadow mt-3 p-2">
                  <li>
                    <span>{user.user_metadata?.full_name ?? "Foydalanuvchi"}</span>
                  </li>
                  <li>
                    <Link to="/chat">Izohlar</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Hisobdan chiqish</button>
                  </li>
                </ul>
              </div>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
}
