import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuditIQ - Fairness Audit Platform",
  description: "Auditez la fairness de vos systèmes d'IA en conformité AI Act",
  icons: {
    icon: "/assets/logo-auditiq-small.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <header className="w-full border-b border-border bg-card py-3">
          <div className="mx-auto max-w-6xl px-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/assets/logo-auditiq-small.png"
                alt="AuditIQ"
                width={40}
                height={40}
                priority
              />
              <span className="font-semibold">AuditIQ</span>
            </Link>
          </div>
        </header>

        <main>{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}