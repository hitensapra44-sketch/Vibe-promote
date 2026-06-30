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

    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('platform', 'reddit')
      .eq('remind_email', true)
      .eq('reminder_sent', false)
      .lte('remind_at', new Date().toISOString())

    if (error) throw error

    let emailsSent = 0

    for (const post of posts || []) {
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(post.user_id)
        if (userError || !userData?.user?.email) continue

        const subreddit = post.subreddit || ''
        const postLink = subreddit 
          ? `https://vibepromote.tech/auto-poster` 
          : `https://vibepromote.tech/auto-poster`

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
                Reminder: Your Reddit post is ready
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
              <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.6;">
                You asked us to remind you about your scheduled Reddit post.
              </p>
              <div style="margin-top:16px;padding:16px;background:#0A0A0A;border-radius:8px;border:1px solid #1F1F1F;">
                <p style="margin:0;font-size:14px;color:#ffffff;line-height:1.6;">
                  ${post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </p>
                {subreddit && (
                  <p style="margin:12px 0 0;font-size:12px;color:#F97316;font-weight:600;">
                    r/${subreddit}
                  </p>
                )}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 36px;">
              <a href="${postLink}"
                style="display:inline-block;background:#F97316;color:#ffffff;
                  font-size:15px;font-weight:600;text-decoration:none;
                  padding:13px 28px;border-radius:8px;">
                Open Auto Poster
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 36px;border-top:1px solid #1e2130;">
              <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
                You're getting this because you use Vibe Promote.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

        const resendApiKey = Deno.env.get("RESEND_API_KEY")
        if (!resendApiKey) {
          console.error("[send-reddit-reminders] Missing RESEND_API_KEY")
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
            to: [userData.user.email],
            subject: "Reminder: Your Reddit post is ready",
            html: emailHtml
          })
        })

        if (!resendRes.ok) {
          const errText = await resendRes.text()
          console.error(`[send-reddit-reminders] Resend failed for post ${post.id}:`, errText)
          continue
        }

        await supabase
          .from('scheduled_posts')
          .update({ reminder_sent: true })
          .eq('id', post.id)

        emailsSent++

      } catch (postErr) {
        console.error(`[send-reddit-reminders] Error processing post ${post.id}:`, postErr)
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error("[send-reddit-reminders] Global error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
