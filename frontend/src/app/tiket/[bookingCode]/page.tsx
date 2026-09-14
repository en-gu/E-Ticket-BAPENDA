import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import ETicketClient from './ETicketClient';
import { Ticket } from '@/lib/types';

interface PageProps {
  params: Promise<{ bookingCode: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bookingCode } = await params;
  return {
    title: `E-Tiket ${bookingCode} | Bapenda Kab. Garut`,
    description: 'E-Tiket Antrean Loket Bapenda Kabupaten Garut',
  };
}

export default async function TiketPage({ params }: PageProps) {
  const { bookingCode } = await params;

  const { data: ticket, error } = await supabaseAdmin
    .from('tickets')
    .select('*, services(*), sessions(*)')
    .eq('booking_code', bookingCode)
    .single();

  if (error || !ticket) {
    notFound();
  }

  return <ETicketClient ticket={ticket as Ticket} />;
}
