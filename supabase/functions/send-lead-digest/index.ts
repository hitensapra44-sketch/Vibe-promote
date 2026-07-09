import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 2. Fetch all rows from brand_brains where user_id is not null
    const { data: brains, error: brainsError } = await supabase
      .from('brand_brains')
      .select('*')
      .not('user_id', 'is', null)

    if (brainsError) throw brainsError

    let emailsSent = 0

    // 3. For each user — wrap in individual try/catch
    for (const brain of brains || []) {
      try {
        const userId = brain.user_id
        const lastNotifiedAt = brain.last_notified_at

        // A. CHECK 2-DAY COOLDOWN
        if (lastNotifiedAt) {
          const lastNotifiedTime = new Date(lastNotifiedAt).getTime()
          const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
          if (lastNotifiedTime > threeDaysAgo) {
            console.log(`[send-lead-digest] Skipping user ${userId} due to 3-day cooldown`);
            continue
          }
        }

        // B. SET CUTOFF DATE
        const cutoff = lastNotifiedAt 
          ?? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

        // C. COUNT NEW LEADS
        const { count: newLeadsCount, error: leadsError } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gt('created_at', cutoff)

        if (leadsError) {
          console.error(`[send-lead-digest] Error counting leads for user ${userId}:`, leadsError)
          continue
        }

        if (!newLeadsCount || newLeadsCount === 0) {
          console.log(`[send-lead-digest] No new leads for user ${userId}. Skipping.`);
          continue
        }

        // D. COUNT CONTENT OPPORTUNITIES
        let contentOpportunities = 0
        try {
          const { count, error: postsError } = await supabase
            .from('generated_posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gt('created_at', cutoff)
          
          if (!postsError && count !== null) {
            contentOpportunities = count
          }
        } catch (_) {
          contentOpportunities = 0
        }

        // E. COUNT PENDING TASKS
        let pendingTasks = 0
        try {
          const { count, error: tasksError } = await supabase
            .from('guided_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('completed', false)
          
          if (!tasksError && count !== null) {
            pendingTasks = count
          }
        } catch (_) {
          pendingTasks = 0
        }

        // F. GET APP NAME
        const appName = brain.product_name || brain.app_name || "your product"

        // G. GET USER EMAIL
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
        if (userError || !userData?.user?.email) {
          console.error(`[send-lead-digest] Could not get email for user ${userId}:`, userError)
          continue
        }
        const email = userData.user.email

        // H. BUILD EMAIL HTML
        const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#12141C;border-radius:12px;border:1px solid #1e2130;overflow:hidden;">

          <tr>
            <td style="padding:32px 36px 0;">
              <p style="margin:0 0 20px;font-size:12px;color:#F97316;font-weight:700;
                letter-spacing:0.08em;text-transform:uppercase;">Vibe Promote</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;
                color:#ffffff;line-height:1.35;">
                ${newLeadsCount} potential users found for ${appName}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 36px;">
              <hr style="border:none;border-top:1px solid #1e2130;margin:0;">
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr><td style="padding:0 0 14px;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width:20px;vertical-align:top;padding-top:8px;">
                      <div style="width:6px;height:6px;background:#F97316;border-radius:50%;"></div>
                    </td>
                    <td>
                      <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.6;">
                        <span style="color:#ffffff;font-weight:600;">${newLeadsCount} people</span>
                        discussing problems ${appName} can solve
                      </p>
                    </td>
                  </tr></table>
                </td></tr>

                <tr><td style="padding:0 0 14px;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width:20px;vertical-align:top;padding-top:8px;">
                      <div style="width:6px;height:6px;background:#F97316;border-radius:50%;"></div>
                    </td>
                    <td>
                      <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.6;">
                        <span style="color:#ffffff;font-weight:600;">
                          ${contentOpportunities} content opportunities</span>
                        for Reddit, X and Threads — using trending post templates
                        going viral right now
                      </p>
                    </td>
                  </tr></table>
                </td></tr>

                <tr><td style="padding:0 0 8px;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width:20px;vertical-align:top;padding-top:8px;">
                      <div style="width:6px;height:6px;background:#F97316;border-radius:50%;"></div>
                    </td>
                    <td>
                      <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.6;">
                        <span style="color:#ffffff;font-weight:600;">
                          ${pendingTasks} simple marketing tasks</span> remaining
                      </p>
                    </td>
                  </tr></table>
                </td></tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 28px;">
              <p style="margin:0;font-size:14px;color:#475569;
                font-style:italic;line-height:1.7;">
                Your next paying user might already be in one of these conversations.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 36px;">
              <a href="https://vibepromote.vercel.app/user-finder"
                style="display:inline-block;background:#F97316;color:#ffffff;
                  font-size:15px;font-weight:600;text-decoration:none;
                  padding:13px 28px;border-radius:8px;">
                Open Dashboard →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 36px;border-top:1px solid #1e2130;">
              <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
                You're getting this because you use Vibe Promote. &nbsp;
                <a href="https://vibepromote.vercel.app/settings"
                  style="color:#475569;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

        // I. SEND EMAIL via Resend
        const resendApiKey = Deno.env.get("RESEND_API_KEY")
        if (!resendApiKey) {
          console.error("[send-lead-digest] Missing RESEND_API_KEY")
          continue
        }

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Vibe Promote <hello@vibepromote.tech>",
            to: [email],
            subject: `${newLeadsCount} potential users found for ${appName}`,
            html: emailHtml,
            reply_to: "vibepromote@gmail.com"
          })
        })

        if (!resendRes.ok) {
          const errText = await resendRes.text()
          console.error(`[send-lead-digest] Resend failed for user ${userId}:`, errText)
          continue
        }

        // J. UPDATE last_notified_at
        await supabase
          .from("brand_brains")
          .update({ last_notified_at: new Date().toISOString() })
          .eq("user_id", userId)

        console.log(`[send-lead-digest] Successfully sent digest to ${email}`)
        emailsSent++

      } catch (userErr) {
        console.error(`[send-lead-digest] Failed processing user ${brain.user_id}:`, userErr)
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error("[send-lead-digest] Global error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})