import { memo } from "react";

const reasons = [
  "Zamonaviy kasb yo‘nalishlari bo‘yicha ta’lim",
  "Amaliy mashg‘ulotlarga yo‘naltirilgan o‘quv jarayoni",
  "Tajribali ustoz va o‘qituvchilar",
  "O‘quvchilar uchun yarmarka va amaliy loyiha imkoniyatlari",
  "Kasbga yo‘naltirish va bandlikka ko‘mak",
];

const contacts = ["Telegram: @texnikum1", "Telefon: (94) 441 14 07", "Email: info@texnikum.uz"];

const About = memo(() => {
  return (
    <div className="max-w-6xl mx-auto lg:mt-36 mb-24 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-8 gap-4">
        <div className="w-full h-72 md:h-auto overflow-hidden">
          <img src="/home-img.jpg" alt="About Image" className="w-full h-full object-cover rounded-md" loading="lazy" />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <p className="text-gray-700 leading-relaxed">
            1-son Texnikumi zamonaviy bilim va amaliy ko‘nikmalarni uyg‘unlashtirgan holda malakali mutaxassislar tayyorlaydi. Texnikumda turli kasb yo‘nalishlari bo‘yicha ta’lim berilib,
            o‘quvchilarning bilimlarini amaliyotda qo‘llashiga alohida e’tibor qaratiladi. Yarmarka orqali o‘quvchilar o‘zlari tayyorlagan mahsulotlarni namoyish etish va sotish imkoniyatiga ega.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-3">Nima uchun biz?</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Aloqa</h2>
            {contacts.map((c, i) => (
              <p key={i} className="text-gray-700">
                {c}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default About;
