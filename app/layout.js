"use client";

import { UserProvider } from './context/UserContext';
import localFont from "next/font/local";
import Link from 'next/link';
import "./globals.css";
import UserNav from '../components/UserNav';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <UserProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <nav className="bg-blue-500 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">Budzdy</Link>
              <UserNav />
            </div>
          </nav>
          <main>{children}</main>
        </body>
      </html>
    </UserProvider>
  );
}
