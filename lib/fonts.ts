import { DM_Serif_Text, DM_Sans, IBM_Plex_Mono } from "next/font/google";

export const fraunces = DM_Serif_Text({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const inter = DM_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
