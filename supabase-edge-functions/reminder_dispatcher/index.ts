// Supabase Edge Function for dispatching reminders
// Deploy with: supabase functions deploy reminder_dispatcher
// Set up cron: Run daily at 08:00 Asia/Jakarta

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface Reminder {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  channel: string[]
  due_at: string
  recur_rule: string | null
  is_active: boolean
  debt_id: string | null
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current timestamp
    const now = new Date().toISOString()

    // Fetch due reminders
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_active", true)
      .lte("due_at", now)

    if (error) {
      console.error("Error fetching reminders:", error)
      return new Response(
        JSON.stringify({ error: "Failed to fetch reminders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const results = []

    // Process each reminder
    for (const reminder of reminders as Reminder[]) {
      try {
        // Send notifications based on channels
        for (const channel of reminder.channel) {
          if (channel === "email") {
            await sendEmailNotification(reminder)
          } else if (channel === "telegram") {
            await sendTelegramNotification(reminder)
          } else if (channel === "webhook") {
            await sendWebhookNotification(reminder)
          }
        }

        // Log successful firing
        await supabase.from("reminder_logs").insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          fired_at: now,
          status: "sent",
          response: { channels: reminder.channel },
        })

        // Handle recurring reminders
        if (reminder.recur_rule) {
          const nextDueAt = calculateNextDueDate(reminder.due_at, reminder.recur_rule)
          await supabase
            .from("reminders")
            .update({ due_at: nextDueAt, last_fired_at: now })
            .eq("id", reminder.id)
        } else {
          // One-time reminder, deactivate it
          await supabase
            .from("reminders")
            .update({ is_active: false, last_fired_at: now })
            .eq("id", reminder.id)
        }

        results.push({ id: reminder.id, status: "success" })
      } catch (error: any) {
        console.error(`Error processing reminder ${reminder.id}:`, error)

        // Log failure
        await supabase.from("reminder_logs").insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          fired_at: now,
          status: "failed",
          response: { error: error.message },
        })

        results.push({ id: reminder.id, status: "failed", error: error.message })
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Edge function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

// Notification handlers (implement based on your requirements)

async function sendEmailNotification(reminder: Reminder) {
  // TODO: Implement email sending (e.g., using SendGrid, Resend, etc.)
  console.log(`Sending email reminder: ${reminder.title}`)

  // Example using Resend:
  // const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
  // await resend.emails.send({
  //   from: "reminders@yourapp.com",
  //   to: reminder.user_email,
  //   subject: reminder.title,
  //   text: reminder.message || reminder.title,
  // })
}

async function sendTelegramNotification(reminder: Reminder) {
  // TODO: Implement Telegram bot notification
  console.log(`Sending Telegram reminder: ${reminder.title}`)

  // Example:
  // const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN")
  // const chatId = reminder.user_telegram_id
  // await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     chat_id: chatId,
  //     text: `${reminder.title}\n\n${reminder.message || ""}`,
  //   }),
  // })
}

async function sendWebhookNotification(reminder: Reminder) {
  // TODO: Implement webhook notification
  console.log(`Sending webhook reminder: ${reminder.title}`)

  // Example:
  // const webhookUrl = Deno.env.get("WEBHOOK_URL")
  // await fetch(webhookUrl, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     type: "reminder",
  //     reminder_id: reminder.id,
  //     title: reminder.title,
  //     message: reminder.message,
  //     due_at: reminder.due_at,
  //   }),
  // })
}

function calculateNextDueDate(currentDueAt: string, recurRule: string): string {
  // Simple implementation - extend based on RFC 5545 RRULE
  // This is a basic example for daily recurrence

  const current = new Date(currentDueAt)

  if (recurRule.includes("FREQ=DAILY")) {
    current.setDate(current.getDate() + 1)
  } else if (recurRule.includes("FREQ=WEEKLY")) {
    current.setDate(current.getDate() + 7)
  } else if (recurRule.includes("FREQ=MONTHLY")) {
    current.setMonth(current.getMonth() + 1)
  }

  return current.toISOString()
}
