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
    <div className="border-t bg-base-100 border-base-300">
      <footer className="container mx-auto px-4 py-10 footer">
        <div className="flex flex-col sm:flex-row gap-10 w-full items-center sm:items-start justify-center sm:justify-between text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start max-w-xs">
            <a href="/" className="text-3xl font-semibold text-text-main">
              TEXNIKUM
            </a>
            <a href="https://maps.app.goo.gl/rgwaKGch5jPKVe286" className="hover:text-primary mt-5">
              Farg'ona viloyati, Rishton tumani <br /> Farg'ona yo'li ko'chasi 1-son Texnikumi
            </a>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3040.67920095949!2d71.2771916!3d40.3494619!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bbab1df919f7f7%3A0x6cf85197ab5f9fa2!2sRishton.%201-sonli%20Kasb%20hunar%20kolleji!5e0!3m2!1sen!2s!4v1769100854658!5m2!1sen!2s"
            width="250"
            height="110"
            className="rounded-md"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <nav className="flex flex-col gap-1 items-center sm:items-start">
            <h6 className="text-text-secondary font-semibold mb-2 text-base">Bo'limlar</h6>
            <a href="/" className="hover:text-primary">
              Bosh sahifa
            </a>
            <a href="/" className="hover:text-primary">
              Yarmarka
            </a>
            <a href="/about" className="hover:text-primary">
              Haqida
            </a>
          </nav>

          <nav className="flex flex-col gap-1 items-center sm:items-start">
            <h6 className="text-text-secondary font-semibold mb-2 text-base">Bog'lanish</h6>
            <a href="https://t.me/+99890944411407" className="hover:text-primary">
              Telegram chat
            </a>
            <a href="tel:+998901234567" className="hover:text-primary">
              (94) 441 14 07
            </a>
            <a href="mailto:rishton@tech.uz" className="hover:text-primary">
              info@politex.uz
            </a>
          </nav>

          <nav className="flex flex-col items-center sm:items-start">
            <h6 className="text-text-secondary font-semibold mb-2 text-base">Ijtimoiy tarmoqlar</h6>
            <div className="grid grid-flow-col gap-2">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} className="p-1 border border-base-300 rounded-lg bg-white hover:bg-primary hover:text-primary-content transition-all duration-300">
                  {s.icon}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </footer>

      <div className="border-t py-4 text-center text-gray-500 text-sm border-base-300">© {year} 1-techrishton.uz</div>
    </div>
  );
}
