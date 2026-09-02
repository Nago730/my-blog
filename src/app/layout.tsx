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
    default: "My Space",
    template: "%s | My Space",
  },
  description: "일정 관리, 학습 및 기록을 담은 통합 개인 웹 서비스",
  keywords: ["Next.js", "React", "TypeScript", "Workspace"],
  authors: [{ name: "Jun" }],
  creator: "Jun",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://justjun.com",
    siteName: "My Space",
    images: [
      {
        url: "/default-og.svg",
        width: 1200,
        height: 630,
        alt: "My Space",
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

