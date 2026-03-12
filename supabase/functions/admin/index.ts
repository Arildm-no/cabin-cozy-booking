import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data, error } = await supabase.rpc('verify_password', {
    username_input: username,
    password_input: password
  })
  if (error || !data) return false
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, username, password, ...params } = await req.json()

    // Verify credentials for every request
    const isValid = await verifyAdmin(username, password)
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use service role for all admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let result: any

    switch (action) {
      // === BOOKINGS ===
      case 'get_pending_bookings': {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
        if (error) throw error
        result = data
        break
      }

      case 'get_approved_bookings': {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('status', 'approved')
          .order('start_date', { ascending: false })
        if (error) throw error
        result = data
        break
      }

      case 'update_booking_status': {
        const { error } = await supabase
          .from('bookings')
          .update({ status: params.status })
          .eq('id', params.booking_id)
        if (error) throw error
        result = { success: true }
        break
      }

      case 'delete_booking': {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', params.booking_id)
        if (error) throw error
        result = { success: true }
        break
      }

      // === CABIN INFO ===
      case 'create_cabin_info': {
        const { error } = await supabase
          .from('cabin_info')
          .insert([params.info])
        if (error) throw error
        result = { success: true }
        break
      }

      case 'update_cabin_info': {
        const { error } = await supabase
          .from('cabin_info')
          .update(params.info)
          .eq('id', params.info_id)
        if (error) throw error
        result = { success: true }
        break
      }

      case 'delete_cabin_info': {
        const { error } = await supabase
          .from('cabin_info')
          .delete()
          .eq('id', params.info_id)
        if (error) throw error
        result = { success: true }
        break
      }

      // === SUPPLIES ===
      case 'create_supply': {
        const { error } = await supabase
          .from('supplies')
          .insert([params.supply])
        if (error) throw error
        result = { success: true }
        break
      }

      case 'update_supply': {
        const { error } = await supabase
          .from('supplies')
          .update(params.supply)
          .eq('id', params.supply_id)
        if (error) throw error
        result = { success: true }
        break
      }

      case 'delete_supply': {
        const { error } = await supabase
          .from('supplies')
          .delete()
          .eq('id', params.supply_id)
        if (error) throw error
        result = { success: true }
        break
      }

      // === USERS ===
      case 'get_users': {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, is_active, created_at, updated_at')
          .order('username')
        if (error) throw error
        result = data
        break
      }

      case 'create_user': {
        // Hash password with pgcrypto
        const { error } = await supabase.rpc('create_user_with_hash', {
          username_input: params.new_username,
          password_input: params.new_password
        })
        if (error) throw error
        result = { success: true }
        break
      }

      case 'toggle_user_status': {
        const { error } = await supabase
          .from('users')
          .update({ is_active: params.new_status })
          .eq('id', params.user_id)
        if (error) throw error
        result = { success: true }
        break
      }

      case 'delete_user': {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', params.user_id)
        if (error) throw error
        result = { success: true }
        break
      }

      case 'reset_password': {
        const { data, error } = await supabase.rpc('update_user_password', {
          username_input: params.target_username,
          new_password: params.new_password
        })
        if (error) throw error
        result = { success: true }
        break
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Admin function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
