import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { post_id, platform, content, scheduled_at, subreddit } = await req.json()

    if (!post_id || !platform || !content || !scheduled_at) {
      return new Response(JSON.stringify({ error: 'Missing required fields: post_id, platform, content, scheduled_at' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const bufferToken = Deno.env.get('BUFFER_ACCESS_TOKEN')
    const channelX = Deno.env.get('BUFFER_CHANNEL_X')
    const channelThreads = Deno.env.get('BUFFER_CHANNEL_THREADS')

    if (platform === 'reddit') {
      const { error: updateError } = await supabase
        .from('scheduled_posts')
        .update({ status: 'scheduled' })
        .eq('id', post_id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('[schedule-post] Reddit update error:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update post status' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if ((platform === 'x' || platform === 'threads') && bufferToken) {
      const channelId = platform === 'x' ? channelX : channelThreads

      if (!channelId) {
        return new Response(JSON.stringify({ error: `Buffer channel not configured for ${platform}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const mutation = `
        mutation {
          createPost(input: {
            text: "${content.replace(/"/g, '\\"')}",
            channelId: "${channelId}",
            schedulingType: automatic,
            mode: customScheduled,
            dueAt: "${scheduled_at}"
          }) {
            ... on PostActionSuccess { post { id } }
            ... on MutationError { message }
          }
        }
      `

      try {
        const bufferRes = await fetch('https://api.buffer.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bufferToken}`,
          },
          body: JSON.stringify({ query: mutation }),
        })

        if (!bufferRes.ok) {
          const errText = await bufferRes.text()
          throw new Error(`Buffer API error: ${bufferRes.status} - ${errText}`)
        }

        const bufferData = await bufferRes.json()
        const bufferResult = bufferData?.data?.createPost

        if (bufferResult?.__typename === 'PostActionSuccess' && bufferResult.post?.id) {
          const { error: updateError } = await supabase
            .from('scheduled_posts')
            .update({
              status: 'scheduled',
              buffer_id: bufferResult.post.id,
            })
            .eq('id', post_id)
            .eq('user_id', user.id)

          if (updateError) {
            console.error('[schedule-post] Update error:', updateError)
            return new Response(JSON.stringify({ error: 'Failed to update post status' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        } else if (bufferResult?.__typename === 'MutationError') {
          const errorMsg = bufferResult.message || 'Buffer API returned an error'

          const { error: updateError } = await supabase
            .from('scheduled_posts')
            .update({
              status: 'failed',
              error_message: errorMsg,
            })
            .eq('id', post_id)
            .eq('user_id', user.id)

          if (updateError) {
            console.error('[schedule-post] Update error:', updateError)
          }

          return new Response(JSON.stringify({ success: false, error: errorMsg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        } else {
          throw new Error('Unexpected response from Buffer API')
        }
      } catch (err: any) {
        console.error('[schedule-post] Buffer API error:', err.message)

        const { error: updateError } = await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: err.message,
          })
          .eq('id', post_id)
          .eq('user_id', user.id)

        if (updateError) {
          console.error('[schedule-post] Update error:', updateError)
        }

        return new Response(JSON.stringify({ success: false, error: err.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid platform or missing Buffer token' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("[schedule-post] Global Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
