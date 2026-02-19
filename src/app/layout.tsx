import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://justjun.com"),
  title: {
    default: "Jun's Blog",
    template: "%s | Jun's Blog",
  },
  description: "개발 경험을 공유하는 블로그입니다.",
  keywords: ["Next.js", "React", "TypeScript", "Blog", "Development"],
  authors: [{ name: "Jun" }],
  creator: "Jun",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://justjun.com",
    siteName: "Jun's Blog",
    images: [
      {
        url: "/default-og.svg",
        width: 1200,
        height: 630,
        alt: "Jun's Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/default-og.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
