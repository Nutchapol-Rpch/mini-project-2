"use client";

import { UserProvider } from './context/UserContext';
import { useEffect, useState } from 'react';
import localFont from "next/font/local";
import Link from 'next/link';
import "./globals.css";
import { metadata } from './metadata';
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

// Remove or move the metadata export to a separate file
// export const metadata = {
//   title: "FlashLearn",
//   description: "Create, study, and master your flashcards",
// };

export default function RootLayout({ children }) {
  return (
    <UserProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <nav className="bg-blue-500 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">FlashLearn</Link>
              <UserNav />
            </div>
          </nav>
          <main>{children}</main>
        </body>
      </html>
    </UserProvider>
  );
}
