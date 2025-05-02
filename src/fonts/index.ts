import { Geist, Geist_Mono } from "next/font/google";
import { nohemi } from "@/fonts/Nohemi";
import { helvetica } from "./Helvetica";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${nohemi.variable} ${helvetica.variable}`;
