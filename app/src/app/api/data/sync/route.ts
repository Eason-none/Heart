import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const { device_id, data } = await req.json() as {
    device_id: string
    data: Record<string, unknown>
  }

  if (!device_id || !UUID_RE.test(device_id)) {
    return new Response('Invalid device_id', { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return new Response('Service unavailable', { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const { error } = await supabase
    .from('user_data')
    .upsert({
      device_id,
      assessment_answers: data.assessment_answers ?? null,
      exercise_sessions: data.exercise_sessions ?? null,
      followup_records: data.followup_records ?? null,
      learn_card_state: data.learn_card_state ?? null,
      symptom_lock: data.symptom_lock ?? null,
      exercise_pause: data.exercise_pause ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'device_id' })

  if (error) {
    return new Response(JSON.stringify({ error: error.message, code: error.code }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response('OK')
}
