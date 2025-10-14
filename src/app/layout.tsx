// app/layout.tsx (NÃO colocar 'use client')

import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "./StoreProvider"; // 🔁 veja passo 2

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ metadata no layout (funciona porque não tem 'use client')
export const metadata = {
  title: "Balance Coin",
  description: "Seu gerenciador financeiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Redux Provider separado num componente client-only */}
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
