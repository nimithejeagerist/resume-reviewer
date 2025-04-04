import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sono } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sono = Sono({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: true,
});

export const metadata = {
  title: "Resume Reviewer",
  description: "AI-powered resume review tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={sono.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
