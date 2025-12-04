import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { AppLayout } from "@/components/app-layout"; // <--- IMPORT THIS
import './globals.css';

export const metadata: Metadata = {
  title: 'GlamOps',
  description: 'Salon Management Made Easy',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* WRAP CHILDREN IN APP LAYOUT TO SHOW SIDEBAR */}
        <AppLayout>
            {children}
        </AppLayout>
        
        <Toaster />
      </body>
    </html>
  );
}