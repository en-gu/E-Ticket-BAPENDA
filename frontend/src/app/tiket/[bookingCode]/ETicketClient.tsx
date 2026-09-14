'use client';

import { Ticket } from '@/lib/types';
import ETicket from '@/components/tiket/ETicket';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import Link from 'next/link';
import { useCallback } from 'react';

interface Props {
  ticket: Ticket;
}

export default function ETicketClient({ ticket }: Props) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadImage = async () => {
    const element = document.getElementById('eticket-area');
    if (!element) return;

    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `Tiket-Bapenda-${ticket.booking_code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Gagal mengunduh tiket:', error);
      alert('Terjadi kesalahan saat menyimpan tiket.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* E-Ticket */}
      <div className="max-w-2xl mx-auto">
        <ETicket ticket={ticket} />
      </div>

      {/* Bottom Action Bar */}
      <div className="max-w-2xl mx-auto mt-4 flex items-center justify-between gap-3 no-print">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold hover:border-gray-300 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Simpan Tiket</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Tiket
          </button>
        </div>
      </div>

      {/* Print styles inline */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .ticket-print-area { 
            box-shadow: none !important; 
            max-width: 100% !important;
            margin: 0 !important;
          }
          #eticket-area { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
