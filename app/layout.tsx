import type { Metadata } from "next";
import { Tajawal, Lalezar, El_Messiri, Cairo, Changa, Amiri, Reem_Kufi, Katibeh, Scheherazade_New, Harmattan, Aref_Ruqaa, Lemonada, Marhey, Rakkas, Readex_Pro, Almarai, Lateef } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({ weight: ["900"], subsets: ["arabic"], variable: "--font-tajawal" });
const lalezar = Lalezar({ weight: ["400"], subsets: ["arabic"], variable: "--font-lalezar" });
const elMessiri = El_Messiri({ weight: ["700"], subsets: ["arabic"], variable: "--font-el-messiri" });
const cairo = Cairo({ weight: ["900"], subsets: ["arabic"], variable: "--font-cairo" });
const changa = Changa({ weight: ["800"], subsets: ["arabic"], variable: "--font-changa" });
const amiri = Amiri({ weight: ["700"], subsets: ["arabic"], variable: "--font-amiri" });
const reemKufi = Reem_Kufi({ weight: ["700"], subsets: ["arabic"], variable: "--font-reem-kufi" });
const katibeh = Katibeh({ weight: ["400"], subsets: ["arabic"], variable: "--font-katibeh" });
const scheherazade = Scheherazade_New({ weight: ["700"], subsets: ["arabic"], variable: "--font-scheherazade" });
const harmattan = Harmattan({ weight: ["700"], subsets: ["arabic"], variable: "--font-harmattan" });
const arefRuqaa = Aref_Ruqaa({ weight: ["700"], subsets: ["arabic"], variable: "--font-aref-ruqaa" });
const lemonada = Lemonada({ weight: ["700"], subsets: ["arabic"], variable: "--font-lemonada" });
const marhey = Marhey({ weight: ["700"], subsets: ["arabic"], variable: "--font-marhey" });
const rakkas = Rakkas({ weight: ["400"], subsets: ["arabic"], variable: "--font-rakkas" });
const readexPro = Readex_Pro({ weight: ["700"], subsets: ["arabic"], variable: "--font-readex-pro" });
const almarai = Almarai({ weight: ["800"], subsets: ["arabic"], variable: "--font-almarai" });
const lateef = Lateef({ weight: ["400"], subsets: ["arabic"], variable: "--font-lateef" });

export const metadata: Metadata = {
  title: "أداة دمج بيانات الشبكات على الصور - محفظة جيب",
  description: "أداة لتعديل الصور وتصميم كروت الشبكات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.variable} ${lalezar.variable} ${elMessiri.variable} ${cairo.variable} ${changa.variable} ${amiri.variable} ${reemKufi.variable} ${katibeh.variable} ${scheherazade.variable} ${harmattan.variable} ${arefRuqaa.variable} ${lemonada.variable} ${marhey.variable} ${rakkas.variable} ${readexPro.variable} ${almarai.variable} ${lateef.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
