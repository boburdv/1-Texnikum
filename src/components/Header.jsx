import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PhoneIcon, EnvelopeIcon, ClockIcon, UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { FaInstagram, FaSignOutAlt } from "react-icons/fa";
import { SiTelegram } from "react-icons/si";
import { GrYoutube } from "react-icons/gr";
import { supabase } from "../supabase";
import { FaUser, FaUserShield } from "react-icons/fa6";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const lastScrollY = useRef(0);

  const socialLinks = [
    { icon: <SiTelegram className="w-4 h-4" />, href: "#" },
    { icon: <FaInstagram className="w-4 h-4" />, href: "#" },
    { icon: <GrYoutube className="w-4 h-4" />, href: "#" },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setShowHeader(current <= lastScrollY.current || current < 80);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast("Hisobdan chiqildi!", "success");
    navigate("/");
  };

  return (
    <div className="relative">
      {toast.message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 z-50 ${toast.visible ? "opacity-100" : "opacity-0"}`}>
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className={`fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-xs transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-base-200 border-b border-base-300">
          <div className="max-w-6xl mx-auto flex justify-between items-center py-1.5 px-4 text-sm text-base-content">
            <div className="flex gap-5">
              <div className="flex items-center gap-1">
                <PhoneIcon className="w-4 h-4" /> (94) 441 14 07
              </div>
              <div className="hidden md:flex items-center gap-1">
                <EnvelopeIcon className="w-4 h-4" /> info@politex.uz
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> 09:00 - 18:00
              </div>
              <div className="hidden md:flex gap-1.5 ml-3">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.href} className="p-1 border border-base-300 rounded-lg bg-base-100 hover:bg-primary hover:text-primary-content">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="navbar bg-base-100 px-4 max-w-6xl mx-auto">
          <div className="flex-1 justify-start">
            <button className="md:hidden">{mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6 mt-1.5" />}</button>

            <Link to="/" className="hidden md:block text-[25px] font-semibold text-base-content">
              TEXNIKUM
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-base-content">
            <Link to="/" className="hover:text-primary">
              Bosh sahifa
            </Link>
            <Link to="/about" className="hover:text-primary">
              Haqida
            </Link>
            <Link to="/" onClick={() => document.getElementById("yarmarka")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-primary">
              Yarmarka
            </Link>
          </nav>

          <div className="flex-none ml-6">
            {!user ? (
              <Link to="/auth" className="btn btn-primary btn-sm gap-1">
                Kirish <UserIcon className="w-4 h-4" />
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="rounded-full overflow-hidden">
                  <div className="bg-primary text-primary-content w-8 h-8 flex items-center justify-center">{user.user_metadata?.full_name?.[0]?.toUpperCase() ?? "U"}</div>
                </button>
                <ul className="dropdown-content menu bg-base-100 rounded-box w-52 shadow mt-3 p-2">
                  <li className="disabled">
                    <Link className="flex items-center gap-2">
                      <FaUser />
                      <span className="line-clamp-1">{user.user_metadata?.full_name}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" className="flex items-center gap-2">
                      <FaUserShield />
                      <span>Admin panel</span>
                    </Link>
                  </li>
                  <li className="text-error">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full">
                      <FaSignOutAlt />
                      <span>Hisobdan chiqish</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-base-100 shadow-md z-40 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-base-300">
              <Link to="/" className="text-[25px] font-semibold text-base-content">
                TEXNIKUM
              </Link>
              <button>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-3 text-sm font-medium text-base-content">
              <Link to="/" className="hover:text-primary">
                Bosh sahifa
              </Link>
              <Link to="/about" className="hover:text-primary">
                Haqida
              </Link>
              <Link to="/" onClick={() => document.getElementById("yarmarka")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-primary">
                Yarmarka
              </Link>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
