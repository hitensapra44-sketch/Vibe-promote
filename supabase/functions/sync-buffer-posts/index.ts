import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = { 
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 
}

// Buffer PostMetricType values we care about, mapped to our social_posts columns
function extractMetrics(metrics: any[] | null) { 
  const out = { views: 0, engagements: 0, comments: 0, link_clicks: 0 } 
  if (!metrics) return out

  for (const m of metrics) { 
    const val = m.value ?? 0 
    switch (m.type) { 
      case 'impressions': 
      case 'views': 
      case 'reach': 
        out.views += val 
        break 
      case 'reactions': 
      case 'likes': 
      case 'shares': 
      case 'reposts': 
        out.engagements += val 
        break 
      case 'comments': 
        out.comments += val 
        break 
      case 'clicks': 
        out.link_clicks += val 
        break 
    } 
  } 
  return out 
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }) 
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get this user's connected Buffer channels (do not touch how these are written)
    const { data: accounts, error: acctError } = await supabase
      .from('social_accounts')
      .select('platform, buffer_access_token, buffer_channel_id, buffer_channel_name, username')
      .eq('user_id', user.id)
      .not('buffer_channel_id', 'is', null)

    if (acctError) {
      console.error('[sync-buffer-posts] Failed to load social_accounts:', acctError)
      return new Response(JSON.stringify({ error: 'Failed to load connected accounts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ success: true, synced: 0, message: 'No connected Buffer channels found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // We need the organizationId to query posts(). Fetch it once using the first account's token.
    const accessToken = accounts[0].buffer_access_token
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No Buffer access token found. Please reconnect Buffer.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const orgResponse = await fetch('https://api.buffer.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query { account { organizations { id } } }`
      }),
    })

    const orgJson = await orgResponse.json()
    if (orgJson.errors) {
      console.error('[sync-buffer-posts] Org fetch GraphQL errors:', JSON.stringify(orgJson.errors))
      return new Response(JSON.stringify({ error: 'Buffer GraphQL error: ' + orgJson.errors[0]?.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const orgIds = (orgJson.data?.account?.organizations || []).map((o: any) => o.id)
    const channelIds = accounts.map(a => a.buffer_channel_id).filter(Boolean)

    let totalSynced = 0
    const errors: string[] = []

    for (const orgId of orgIds) {
      const postsQuery = `
        query GetPosts($input: PostsInput!, $first: Int) {
          posts(input: $input, first: $first) {
            edges {
              node {
                id
                channelId
                channelService
                text
                status
                sentAt
                externalLink
                metricsUpdatedAt
                metrics {
                  type
                  value
                }
              }
            }
          }
        }
      `

      const postsResponse = await fetch('https://api.buffer.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: postsQuery,
          variables: {
            input: {
              organizationId: orgId,
              filter: {
                channelIds: channelIds,
                status: ['sent']
              }
            },
            first: 50
          }
        }),
      })

      const postsText = await postsResponse.text()
      let postsJson
      try {
        postsJson = JSON.parse(postsText)
      } catch (e) {
        console.error(`[sync-buffer-posts] Failed to parse posts response for org ${orgId}:`, postsText)
        errors.push(`Org ${orgId}: invalid response`)
        continue
      }

      if (postsJson.errors) {
        console.error(`[sync-buffer-posts] Posts GraphQL errors for org ${orgId}:`, JSON.stringify(postsJson.errors))
        errors.push(`Org ${orgId}: ${postsJson.errors[0]?.message}`)
        continue
      }

      const edges = postsJson.data?.posts?.edges || []

      for (const edge of edges) {
        const post = edge.node
        const account = accounts.find(a => a.buffer_channel_id === post.channelId)
        if (!account) continue

        const { views, engagements, comments, link_clicks } = extractMetrics(post.metrics)

        const { error: upsertError } = await supabase
          .from('social_posts')
          .upsert({
            user_id: user.id,
            platform: account.platform,
            buffer_post_id: post.id,
            title: post.text || '(no text)',
            external_link: post.externalLink || null,
            views,
            engagements,
            comments,
            link_clicks,
            metrics_updated_at: post.metricsUpdatedAt || null,
            created_at: post.sentAt || new Date().toISOString(),
          }, {
            onConflict: 'user_id,buffer_post_id'
          })

        if (upsertError) {
          console.error('[sync-buffer-posts] Upsert error:', upsertError)
          errors.push(upsertError.message)
        } else {
          totalSynced++
        }
      }
    }

    console.log(`[sync-buffer-posts] Synced ${totalSynced} posts. Errors: ${errors.length}`)

    return new Response(JSON.stringify({
      success: true,
      synced: totalSynced,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) { 
    console.error('[sync-buffer-posts] Global error:', error.message) 
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    }) 
  }
})