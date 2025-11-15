import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Himel's Library",
  description: "Your online book library management system",
  icons: {
    icon: "/logo.svg", // this sets the tab icon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
