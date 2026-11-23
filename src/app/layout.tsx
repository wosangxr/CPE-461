import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Fix Service - มหาวิทยาลัยศรีปทุม',
  description: 'ระบบแจ้งซ่อมและติดตามสถานะงานซ่อม ภายในมหาวิทยาลัยศรีปทุม เชื่อมต่อ MQTT / HMI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full bg-slate-50 dark:bg-slate-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-slate-800 dark:text-slate-100`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
