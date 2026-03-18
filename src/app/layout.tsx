import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "RENTA-Z — Rent Anything. Earn From Everything.",
  description: "The marketplace to rent cameras, vehicles, tools, venues, electronics and more. Secure bookings with escrow protection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AppProvider>
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
