import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const { device_id } = await req.json() as { device_id: string }

  if (!device_id || !UUID_RE.test(device_id.trim())) {
    return new Response('Invalid device_id', { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return new Response('Service unavailable', { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const { data, error } = await supabase
    .from('user_data')
    .select('assessment_answers, exercise_sessions, followup_records, learn_card_state, symptom_lock, exercise_pause')
    .eq('device_id', device_id.trim())
    .single()

  if (error || !data) {
    return new Response('Not found', { status: 404 })
  }

  return Response.json(data)
}
