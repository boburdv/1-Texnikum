import { FaInstagram } from "react-icons/fa6";
import { GrYoutube } from "react-icons/gr";
import { SiTelegram } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();

  const socialLinks = [
    { icon: <SiTelegram className="w-5 h-5" />, href: "#" },
    { icon: <FaInstagram className="w-5 h-5" />, href: "#" },
    { icon: <GrYoutube className="w-5 h-5" />, href: "#" },
  ];

  return (
    <div className="border-t border-base-300 bg-base-200">
      <footer className="max-w-6xl mx-auto px-4 py-10 footer">
        <div className="flex flex-col sm:flex-row gap-10 w-full items-center sm:items-start justify-center sm:justify-between text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start max-w-xs">
            <a href="/" className="text-3xl font-semibold text-gray-700">
              POLITEXNIKUM
            </a>
            <a href="https://maps.app.goo.gl/rgwaKGch5jPKVe286" className="hover:text-primary max-w-60 mt-5">
              Farg'ona viloyati, Rishton tumani Farg'ona yo'li ko'chasi 1-son
            </a>
          </div>

          <nav className="flex flex-col gap-1 items-center sm:items-start">
            <h6 className="text-gray-500 font-semibold mb-2 text-base">Bo'limlar</h6>
            <a href="/" className="hover:text-primary">
              Bosh sahifa
            </a>
            <a href="/admin" className="hover:text-primary">
              Admin panel
            </a>
            <a href="/about" className="hover:text-primary">
              Haqida
            </a>
          </nav>

          <nav className="flex flex-col gap-1 items-center sm:items-start">
            <h6 className="text-gray-500 font-semibold mb-2 text-base">Bog'lanish</h6>
            <a href="https://t.me/+99890944411407" className="hover:text-primary">
              Telegram chat
            </a>
            <a href="tel:+998901234567" className="hover:text-primary">
              (90) 94 441 1407
            </a>
            <a href="mailto:rishton@tech.uz" className="hover:text-primary">
              rishton@tech.uz
            </a>
          </nav>

          <nav className="flex flex-col items-center sm:items-start">
            <h6 className="text-gray-500 font-semibold mb-2 text-base">Ijtimoiy tarmoqlar</h6>
            <div className="grid grid-flow-col gap-2">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} className="p-1 border border-base-300 rounded-lg bg-white hover:bg-primary hover:text-white transition">
                  {s.icon}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </footer>

      <div className="border-t border-base-300 py-4 text-center text-sm text-base-content/70">© {year} Politexnikum</div>
    </div>
  );
}
