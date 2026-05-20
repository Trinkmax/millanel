import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://millanel-frias.vercel.app",
  ),
  title: {
    default: "Millanel · Frías — Perfumería & Cosmética",
    template: "%s · Millanel Frías",
  },
  description:
    "Distribuidora oficial Millanel en Frías, Santiago del Estero. Perfumes, lociones, cosmética y cuidado personal. Retiro en Rivadavia 664 y envíos a todo el país.",
  keywords: [
    "Millanel",
    "perfumería",
    "Frías",
    "Santiago del Estero",
    "Cintia Barletta",
    "cosmética",
    "perfumes",
    "lociones",
    "Argentina",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Millanel Frías",
    title: "Millanel · Frías — Perfumería & Cosmética",
    description:
      "Una experiencia perfumada para tu día a día. Retiro en Frías y envío nacional.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Millanel · Frías",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!font-sans !rounded-lg !border-line !bg-pearl !text-ink !shadow-soft",
              title: "!font-medium",
              description: "!text-mute",
            },
          }}
        />
      </body>
    </html>
  );
}
