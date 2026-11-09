import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/toast";
import AIAssistantWidget from "@/components/AIAssistantWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Healora | Where Healthcare Meets Intelligence",
    template: "%s | Healora",
  },
  description: "Where Healthcare Meets Intelligence",
  applicationName: "Healora",
  openGraph: {
    siteName: "Healora",
    title: "Healora | Where Healthcare Meets Intelligence",
    description: "Where Healthcare Meets Intelligence",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <QueryProviders>
          <Toaster>
            {children}
            <AIAssistantWidget />
          </Toaster>
        </QueryProviders>

      </body>
    </html>
  );
}
