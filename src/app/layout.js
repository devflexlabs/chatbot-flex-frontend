// app/layout.js ou RootLayout.js
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"], // adiciona os pesos que você precisa
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Flex IA",
  description: "IA do Grupo Flex com consultas e insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
