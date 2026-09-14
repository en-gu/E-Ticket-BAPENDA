import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Antrean Online | Bapenda Kabupaten Garut',
    template: '%s | Bapenda Kab. Garut',
  },
  description:
    'Portal Pelayanan Antrean Tatap Muka Bapenda Kabupaten Garut. Daftarkan kehadiran Anda secara mudah dan cepat tanpa antre lama di loket.',
  keywords: ['bapenda', 'garut', 'antrean', 'pajak daerah', 'PBB', 'BPHTB', 'tiket online'],
  authors: [{ name: 'Bapenda Kabupaten Garut' }],
  openGraph: {
    title: 'Antrean Online Bapenda Kabupaten Garut',
    description: 'Daftar tiket antrean pelayanan pajak daerah secara online',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} data-scroll-behavior="smooth">
      <body className="font-sans antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
