import AOSInit from "@/components/AOSInit";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/navbar";

export const metadata = {
  title: "MovieTicket | Premium Cinema Booking",
  description: "Book your favorite movies with a professional and stunning interface.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-container">
            <AOSInit />
            <Navbar />
            <Toaster position="bottom-center" />
            <main>{children}</main>
            <footer className="footer">
              <p>© 2026 MovieTicket | Your Ultimate Cinema Experience</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
