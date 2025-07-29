import supabase from '@/lib/utils/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const { seatId, eventId, userId } = body;

  if (!seatId || !eventId || !userId) {
    return new Response('Missing parameters', { status: 400 });
  }

  const { data, error } = await supabase
    .from('seats')
    .update({
      status: 'locked',
      locked_by: userId,
      locked_at: new Date().toISOString(),
    })
    .eq('id', seatId)
    .eq('event_id', eventId)
    .eq('status', 'available')
    .select();

  if (error || !data || data.length === 0) {
    return new Response(JSON.stringify({ success: false, message: error?.message || 'Seat not available' }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
