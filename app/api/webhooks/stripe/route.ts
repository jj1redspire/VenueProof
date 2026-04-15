import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

function getServiceClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan
      if (!userId) break

      await supabase.from('vp_users').upsert({
        id: userId,
        stripe_customer_id: session.customer as string,
        subscription_status: 'trial',
        plan: plan ?? 'starter',
      })

      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as Stripe.Subscription & { current_period_start: number; current_period_end: number }
        await supabase.from('vp_subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription & { current_period_start?: number; current_period_end?: number }
      const userId = sub.metadata?.user_id
      if (!userId) break

      const plan = sub.metadata?.plan ?? 'starter'
      const status = sub.status === 'trialing' ? 'trial' :
                     sub.status === 'active' ? 'active' :
                     sub.status === 'past_due' ? 'past_due' : 'canceled'

      await supabase.from('vp_users').update({ subscription_status: status, plan }).eq('id', userId)
      await supabase.from('vp_subscriptions').update({
        status: sub.status,
        current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription & { current_period_start?: number; current_period_end?: number }
      const userId = sub.metadata?.user_id
      if (!userId) break

      await supabase.from('vp_users').update({ subscription_status: 'canceled', plan: 'free' }).eq('id', userId)
      await supabase.from('vp_subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: vpUser } = await supabase
        .from('vp_users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (vpUser) {
        await supabase.from('vp_users').update({ subscription_status: 'past_due' }).eq('id', vpUser.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
