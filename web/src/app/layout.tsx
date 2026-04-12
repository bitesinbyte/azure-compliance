import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Azure Services Compliance Matrix | Bites In Byte",
  description:
    "Interactive compliance coverage matrix for Azure services. Search, filter, and explore compliance certifications across 17 frameworks for Azure and Azure Government.",
  keywords:
    "Azure, compliance, matrix, ISO 27001, SOC, HIPAA, PCI DSS, HITRUST, CSA STAR, Azure Government",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Azure Services Compliance Matrix | Bites In Byte",
    description:
      "Interactive compliance coverage matrix for Azure services across 17 frameworks.",
    type: "website",
    url: "https://azure-compliance.bitesinbyte.com",
  },
  alternates: {
    canonical: "https://azure-compliance.bitesinbyte.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <Header />
          <main className="mt-14 flex flex-1 flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
