'use client'

import Link from 'next/link'
import { Shield, Camera, Zap, FileText, CheckCircle, ChevronDown, ChevronUp, DollarSign, Thermometer, Users, Clock } from 'lucide-react'
import { useState } from 'react'

const FAQS = [
  {
    q: 'How does delivery path documentation protect me from venue damage claims?',
    a: 'Before you carry a single piece of equipment into the venue, you photograph the delivery path — hallways, elevator, loading dock, door frames. If the venue later claims your crew scratched their marble lobby floor, you have timestamped photos proving the floor condition before you ever touched it. Average venue damage claim against caterers: $1,000–$5,000. Average time to document the delivery path: 3 minutes.',
  },
  {
    q: 'Does VenueProof satisfy health department temperature documentation requirements?',
    a: 'VenueProof generates timestamped temperature logs at setup that satisfy FDA Food Code off-premise catering documentation requirements. Each reading is logged with the food item name, temperature, reading type (hot/cold), timestamp, and compliance status. Your health inspector wants to see this documentation — VenueProof creates it automatically.',
  },
  {
    q: 'How does equipment inventory comparison work?',
    a: 'At delivery, you log your equipment: 48 wine glasses (good), 12 chafing dishes (good), 6 linen sets (good). At pickup, you log what came back. AI compares both lists and flags discrepancies — 4 wine glasses missing, 1 chafing dish damaged. That comparison is your itemized equipment damage invoice.',
  },
  {
    q: 'What if the client disputes that setup was late?',
    a: 'Your setup completion photos are timestamped. Food temperature readings are timestamped. The client signature is timestamped. If your contract says food must be ready by 6:00 PM and your timestamps show setup complete with food at temperature at 5:52 PM, that dispute ends in seconds.',
  },
  {
    q: 'Can I use this alongside my existing catering software?',
    a: 'Yes. VenueProof is documentation-only — it doesn\'t replace your BEO system, ordering platform, or invoicing software. It adds legal-grade evidence to every event that your existing software doesn\'t capture. PDF exports can be attached to your event records.',
  },
  {
    q: 'Does the venue need VenueProof too?',
    a: 'No — VenueProof Catering works independently. But if the venue also uses VenueProof, both documentation sets cover the same event from different angles, creating a complete picture. We call this connected event documentation — and the invite is built right into the app.',
  },
]

export default function CateringLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-charcoal-900 text-white">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-charcoal-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-gold-400" />
            <span className="text-xl font-bold text-white">VenueProof</span>
            <span className="text-xs bg-gold-400/10 text-gold-400 border border-gold-400/20 font-semibold px-2 py-0.5 rounded ml-1">Catering</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white text-sm hidden sm:block">For Venues</Link>
            <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm font-medium hidden sm:block">Log in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Shield className="w-3.5 h-3.5" />
          Caterers & Event Services — 14-Day Free Trial
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
          You Delivered Perfection.
          <br />
          <span className="text-gold-400">Can You Prove It?</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
          Document your delivery, setup, food temperatures, and equipment for every event. Protect against
          venue damage claims, equipment disputes, and food safety compliance gaps.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">Start Your Free 14-Day Trial</Link>
          <Link href="#how-it-works" className="btn-secondary text-base px-8 py-3">See How It Works</Link>
        </div>
        <p className="text-gray-600 text-sm mt-4">Same pricing as VenueProof — $39/$79/$149/mo · No credit card</p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-charcoal-800 border-y border-surface-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-3">How VenueProof Catering Works</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Four steps. Every event documented. Every dispute answered.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: Camera, title: 'Document Arrival Path', desc: 'Before carrying a single item in, photograph the delivery path — hallway, elevator, loading dock. This is your pre-delivery evidence.' },
              { step: '2', icon: Thermometer, title: 'Log Equipment & Temps', desc: 'Log equipment counts and food temperatures at setup. FDA compliance auto-checked. Client signature collected.' },
              { step: '3', icon: Clock, title: 'Timestamp Setup Complete', desc: 'Photo of complete setup with timestamp proves food was ready and at temperature before contracted time.' },
              { step: '4', icon: Zap, title: 'AI Compares At Pickup', desc: 'At equipment return, AI compares delivery inventory vs return. Flags broken glassware, damaged linens, missing items.' },
            ].map((item, i) => (
              <div key={i} className="card text-center">
                <div className="w-8 h-8 bg-gold-400 text-charcoal-900 font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">{item.step}</div>
                <item.icon className="w-7 h-7 text-gold-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value blocks */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-3">What VenueProof Catering Protects</h2>
        <p className="text-center text-gray-400 mb-12">Four categories of catering disputes — all documented</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card flex gap-4">
            <DollarSign className="w-8 h-8 flex-shrink-0 mt-0.5 text-red-400" />
            <div>
              <h3 className="font-semibold text-white mb-2">Venue Damage Defense</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your crew carried 200 lbs of equipment through a marble lobby. If the venue claims you scratched their floor,
                your delivery path photos — timestamped before you brought in a single item — prove otherwise.
              </p>
              <p className="text-sm font-semibold text-red-400 mt-2">Average venue damage claim: $1,000–$5,000</p>
            </div>
          </div>

          <div className="card flex gap-4">
            <FileText className="w-8 h-8 flex-shrink-0 mt-0.5 text-gold-400" />
            <div>
              <h3 className="font-semibold text-white mb-2">Equipment Loss Recovery</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                6 wine glasses broke at the event. 2 linens came back stained. Your delivery inventory vs return comparison
                proves exactly what was delivered, what came back, and what the client owes.
              </p>
              <p className="text-sm font-semibold text-gold-400 mt-2">AI generates itemized replacement cost report</p>
            </div>
          </div>

          <div className="card flex gap-4">
            <Thermometer className="w-8 h-8 flex-shrink-0 mt-0.5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-white mb-2">Food Safety Compliance</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                FDA Food Code requires temperature control documentation for off-premise catering.
                Your temperature logs at setup — cold foods ≤41°F, hot foods ≥135°F — satisfy health
                department requirements and protect you in food safety audits.
              </p>
              <p className="text-sm font-semibold text-blue-400 mt-2">Timestamped compliance logs per item</p>
            </div>
          </div>

          <div className="card flex gap-4">
            <Clock className="w-8 h-8 flex-shrink-0 mt-0.5 text-green-400" />
            <div>
              <h3 className="font-semibold text-white mb-2">Setup Timing Proof</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Client claims food was late and cold. Your timestamped setup photos show everything was ready
                and at temperature 8 minutes before the contracted time. Client coordinator signed off at 5:52 PM.
                That&apos;s not an argument — it&apos;s a record.
              </p>
              <p className="text-sm font-semibold text-green-400 mt-2">Photo + signature + timestamp = proof</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="bg-charcoal-800 border-y border-surface-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">The Catering Math</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { value: '$5,000', label: 'Average catering event value' },
              { value: '$50–200', label: 'Equipment damage per event' },
              { value: '$2,000', label: 'Average venue damage claim' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <p className="text-2xl font-bold text-gold-400">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-300 text-lg">
            VenueProof Catering is <span className="text-gold-400 font-semibold">$39/month</span>.
            One prevented equipment dispute pays for <span className="text-gold-400 font-semibold">4 years</span>.
            One prevented venue damage claim pays for <span className="text-gold-400 font-semibold">50 years</span>.
          </p>
        </div>
      </section>

      {/* Cross-referral ecosystem section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="card border-gold-400/20 text-center">
          <Users className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">The VenueProof Ecosystem</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            When the venue also uses VenueProof, both documentation sets cover the same event from both sides.
            Venue&apos;s pre/post condition report + your delivery and equipment documentation = complete event record.
            No he-said-she-said. Just timestamps and photos.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left mb-6">
            <div className="bg-charcoal-700 rounded-xl p-4">
              <p className="font-semibold text-white mb-2">🏛️ Venue sees:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Pre-event facility condition (all 10 zones)</li>
                <li>• Post-event damage comparison</li>
                <li>• Caterer&apos;s delivery path photos</li>
                <li>• Shared event timeline</li>
              </ul>
            </div>
            <div className="bg-charcoal-700 rounded-xl p-4">
              <p className="font-semibold text-white mb-2">🍽️ Caterer sees:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Venue pre-event condition (delivery path)</li>
                <li>• Equipment delivery inventory</li>
                <li>• Temperature logs at setup</li>
                <li>• Equipment return comparison</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            When you sign up, you&apos;ll see an option to invite your venue contact —
            they get a free month, you get a free month.
          </p>
        </div>
      </section>

      {/* What gets documented */}
      <section className="bg-charcoal-800 border-y border-surface-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-3">What Gets Documented</h2>
          <p className="text-center text-gray-400 mb-10">Five documentation zones per event — all built for caterers</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '🚚', name: 'Delivery Path', desc: 'Hallway, elevator, loading dock, door frames — before equipment enters the building' },
              { emoji: '📦', name: 'Equipment Staging', desc: 'Unpacking area floor and wall condition — before you set up' },
              { emoji: '🍽️', name: 'Food Service Area', desc: 'Buffet setup, plated station, linen placement, temp readings at each station' },
              { emoji: '🍷', name: 'Bar / Beverage Station', desc: 'Glassware count, bottle inventory, bar surface condition, ice supply' },
              { emoji: '👨‍🍳', name: 'Kitchen / Prep Area', desc: 'Venue kitchen condition before and after use — surface, floor, equipment' },
              { emoji: '✍️', name: 'Client Signature', desc: 'Coordinator signs off on completed setup — with timestamp' },
            ].map((item, i) => (
              <div key={i} className="card">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-3">Same Pricing as VenueProof</h2>
        <p className="text-center text-gray-400 mb-12">14-day free trial · No contracts · Cancel anytime</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Single Location', price: 39, venues: '1 location', popular: false, features: ['1 location', 'Unlimited events', 'Delivery path documentation', 'Equipment inventory', 'Food temperature logs', 'Client signature', 'AI equipment comparison', 'PDF export'] },
            { name: 'Multi-Location', price: 79, venues: '2–5 locations', popular: true, features: ['Up to 5 locations', 'Everything in Single', 'Seasonal analytics', 'Priority support'] },
            { name: 'Portfolio', price: 149, venues: '6+ locations', popular: false, features: ['Unlimited locations', 'Everything in Multi', 'White-label reports', 'Team members', 'Dedicated support'] },
          ].map((plan, i) => (
            <div key={i} className={`card flex flex-col relative ${plan.popular ? 'border-gold-400/50' : ''}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-charcoal-900 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
              <div className="flex-1">
                <h3 className="font-bold text-white text-xl">{plan.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.venues}</p>
                <p className="text-4xl font-bold text-gold-400 mt-4">${plan.price}<span className="text-lg text-gray-400">/mo</span></p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/auth/signup" className={`mt-6 block text-center py-3 rounded-lg font-semibold ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-charcoal-800 border-y border-surface-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-10">Catering FAQ</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="card">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full text-left gap-4">
                  <span className="font-semibold text-white">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && <p className="mt-3 text-gray-400 text-sm leading-relaxed">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-gold-600/20 to-gold-400/10 border-y border-gold-400/20 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Your Next Event Is Coming</h2>
          <p className="text-gray-300 mb-6 text-lg">
            Will you have proof of your delivery, your setup, and your equipment?
          </p>
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-block">
            Start Your Free 14-Day Trial — No Credit Card Required
          </Link>
          <p className="text-gray-600 text-sm mt-4">Also available for venues — <Link href="/" className="text-gold-400 hover:text-gold-300">venueproof.io</Link></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-900 border-t border-surface-border py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold-400" />
              <span className="font-bold text-white">VenueProof</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/" className="hover:text-white">For Venues</Link>
              <Link href="/auth/login" className="hover:text-white">Log in</Link>
              <Link href="/auth/signup" className="hover:text-white">Sign up</Link>
            </div>
            <p className="text-gray-600 text-sm">© 2026 VenueProof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
