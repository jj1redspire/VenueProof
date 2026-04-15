'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'
import type { VPUser } from '@/types'

export default function BillingPage() {
  const router = useRouter()
  const [vpUser, setVpUser] = useState<VPUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('vp_users').select('*').eq('id', user.id).single()
      setVpUser(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setCheckoutLoading(null)
  }

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPortalLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>

  const currentPlan = vpUser?.plan ?? 'free'
  const isActive = ['trial', 'active'].includes(vpUser?.subscription_status ?? '')

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        {isActive && vpUser?.stripe_customer_id && (
          <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary text-sm flex items-center gap-2">
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage Billing
          </button>
        )}
      </div>

      {/* Current status */}
      <div className="card">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gold-400" />
          <div>
            <p className="font-semibold text-white">Current Plan: <span className="text-gold-400">{currentPlan === 'free' ? 'Free Trial' : PLANS[currentPlan as keyof typeof PLANS]?.name ?? currentPlan}</span></p>
            <p className="text-sm text-gray-400">
              Status: <span className={vpUser?.subscription_status === 'active' ? 'text-green-400' : vpUser?.subscription_status === 'trial' ? 'text-blue-400' : 'text-orange-400'}>
                {vpUser?.subscription_status ?? 'free'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const isCurrent = currentPlan === key && isActive
          return (
            <div key={key} className={`card flex flex-col ${isCurrent ? 'border-gold-400/50' : ''} ${key === 'pro' ? 'relative' : ''}`}>
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-charcoal-900 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                <p className="text-3xl font-bold text-gold-400 mt-2">${plan.price}<span className="text-base text-gray-400">/mo</span></p>
                <p className="text-sm text-gray-400 mt-1">{plan.venues === 999 ? 'Unlimited' : `Up to ${plan.venues}`} venue{plan.venues !== 1 ? 's' : ''}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5">
                {isCurrent ? (
                  <div className="text-center text-sm text-gold-400 font-medium py-2.5">Current Plan</div>
                ) : (
                  <button
                    onClick={() => handleCheckout(key)}
                    disabled={!!checkoutLoading}
                    className={`w-full flex items-center justify-center gap-2 ${key === 'pro' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {checkoutLoading === key && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isActive ? 'Switch Plan' : 'Start Free Trial'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-gray-500 text-sm">All plans include a 14-day free trial. Cancel anytime.</p>
    </div>
  )
}
