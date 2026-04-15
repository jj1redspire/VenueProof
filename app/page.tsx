'use client'

import Link from 'next/link'
import { Shield, Camera, Zap, FileText, CheckCircle, ChevronDown, ChevronUp, DollarSign, Scale, Users, Star } from 'lucide-react'
import { useState } from 'react'

const FAQS = [
  {
    q: 'What happens if a client disputes the damage charge?',
    a: 'VenueProof gives you timestamped, photo-verified evidence with AI-structured condition reports. Your deposit deduction report shows exactly what changed between pre-event and post-event — with photos side by side. That documentation holds up in small claims court, mediation, and insurance disputes.',
  },
  {
    q: 'How long does a walkthrough take?',
    a: 'Most venue managers complete a 10-zone walkthrough in 15–25 minutes. You snap photos and dictate observations while walking — AI structures everything into a professional report in seconds. No clipboards, no paperwork.',
  },
  {
    q: 'Can my client sign digitally on VenueProof?',
    a: 'Yes. After the pre-event walkthrough, you can collect a digital signature from the client or event planner directly in the app. They\'re acknowledging the documented condition before their event begins — which protects you if they later dispute.',
  },
  {
    q: 'Do I need to photograph every zone?',
    a: 'We recommend it. Zones without photos can still be documented with voice observations, but photos provide the strongest evidence. For high-value events or new clients, photograph everything.',
  },
  {
    q: 'What if I only have one venue?',
    a: 'The Single Venue plan at $39/mo is built for you. Unlimited events, full AI comparison, PDF exports — everything you need for one location.',
  },
  {
    q: 'Is there a contract or commitment?',
    a: 'No contracts. Cancel anytime. Your first 14 days are completely free — no credit card required to start.',
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-charcoal-900 text-white">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-charcoal-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-gold-400" />
            <span className="text-xl font-bold text-white">VenueProof</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm font-medium hidden sm:block">
              Log in
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Shield className="w-3.5 h-3.5" />
          14-Day Free Trial — No Credit Card Required
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
          The Next Event Could Cost You{' '}
          <span className="text-gold-400">Thousands.</span>
          <br />Do You Have Proof?
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
          Document your venue&apos;s condition before and after every event. Protect your damage deposit
          with timestamped, photo-verified evidence — and let AI show exactly what changed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/signup" className="btn-primary text-base px-7 py-3">
            Start Your Free 14-Day Trial
          </Link>
          <Link href="#how-it-works" className="btn-secondary text-base px-7 py-3">
            See How It Works
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-4">No credit card · Cancel anytime · Your next event is coming</p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-3">How VenueProof Works</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Four steps between a handshake and an airtight damage claim
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: Camera, title: 'Walk Your Space Before', desc: 'Before guests arrive, walk each zone. Snap photos and dictate what you see. Takes 20 minutes.' },
            { step: '2', icon: FileText, title: 'Client Acknowledges', desc: 'Client signs digitally — confirming they saw the pre-event condition. No surprises later.' },
            { step: '3', icon: Camera, title: 'Walk It Again After', desc: 'After guests leave, walk the same zones. Same process — photos and voice.' },
            { step: '4', icon: Zap, title: 'AI Shows What Changed', desc: 'AI compares both walkthroughs zone by zone. Flags new damage, missing items, and suggests deductions.' },
          ].map((item, i) => (
            <div key={i} className="card text-center relative">
              <div className="w-8 h-8 bg-gold-400 text-charcoal-900 font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <item.icon className="w-7 h-7 text-gold-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value blocks */}
      <section className="bg-charcoal-800 border-y border-surface-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Why Venue Managers Use VenueProof</h2>
          <p className="text-center text-gray-400 mb-12">Four kinds of protection — one app</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: DollarSign,
                title: 'Damage Deposit Protection',
                desc: 'The average damage deposit dispute is $1,500. Without documentation, you\'re negotiating on memory. With VenueProof, you\'re negotiating with timestamped photos and an AI-generated comparison report.',
                color: 'text-gold-400',
              },
              {
                icon: Shield,
                title: 'Insurance Claim Evidence',
                desc: 'Vandalism, water damage from a vendor, guest injury — insurance adjusters want documentation. VenueProof gives you a professionally formatted before/after report with photo evidence per zone.',
                color: 'text-blue-400',
              },
              {
                icon: Scale,
                title: 'Slip-and-Fall Defense',
                desc: 'The average slip-and-fall settlement is $25,000. If a guest is injured, you need to prove the venue condition at the time of the event. Pre-event documentation is your first line of defense.',
                color: 'text-green-400',
              },
              {
                icon: Users,
                title: 'Professional Client Communication',
                desc: 'A branded PDF report with before/after evidence beats a phone argument every time. Clients know you documented everything. Most disputes end before they start.',
                color: 'text-purple-400',
              },
            ].map((item, i) => (
              <div key={i} className="card flex gap-4">
                <item.icon className={`w-8 h-8 flex-shrink-0 mt-0.5 ${item.color}`} />
                <div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI callout */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="border border-gold-400/30 rounded-2xl p-8 text-center bg-gold-400/5">
          <Star className="w-8 h-8 text-gold-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">The Math Is Simple</h2>
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-3xl font-bold text-gold-400">$1,500</p>
              <p className="text-gray-400 text-sm mt-1">Average deposit dispute</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">$25,000</p>
              <p className="text-gray-400 text-sm mt-1">Average slip-and-fall settlement</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">$39/mo</p>
              <p className="text-gray-400 text-sm mt-1">VenueProof Single Venue plan</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            One documented event pays for <span className="text-gold-400 font-semibold">3 years</span> of VenueProof.
            One prevented slip-and-fall lawsuit pays for <span className="text-gold-400 font-semibold">53 years</span>.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-charcoal-800 border-y border-surface-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-400 mb-12">14-day free trial on every plan. No contracts.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Single Venue',
                price: 39,
                venues: '1 venue',
                popular: false,
                features: [
                  'Unlimited events',
                  'Pre & post walkthroughs',
                  'AI Comparison Engine',
                  'Deposit deduction reports',
                  'PDF export (branded)',
                  'Digital client signature',
                  '10 inspection zones',
                ],
              },
              {
                name: 'Multi-Venue',
                price: 79,
                venues: '2–5 venues',
                popular: true,
                features: [
                  'Everything in Single Venue',
                  'Up to 5 venue locations',
                  'Seasonal analytics',
                  'Event type damage insights',
                  'Priority support',
                ],
              },
              {
                name: 'Portfolio',
                price: 149,
                venues: '6+ venues',
                popular: false,
                features: [
                  'Everything in Multi-Venue',
                  'Unlimited venue locations',
                  'White-label reports',
                  'Team member access',
                  'Dedicated support',
                ],
              },
            ].map((plan, i) => (
              <div key={i} className={`card flex flex-col relative ${plan.popular ? 'border-gold-400/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-charcoal-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-white text-xl">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{plan.venues}</p>
                  <p className="text-4xl font-bold text-gold-400 mt-4">
                    ${plan.price}<span className="text-lg text-gray-400">/mo</span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <Link
                    href="/auth/signup"
                    className={`w-full text-center block py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-10">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="card">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full text-left gap-4"
              >
                <span className="font-semibold text-white">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-gold-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-gold-600/20 to-gold-400/10 border-y border-gold-400/20 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Your Next Event Is Coming
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            Will you have proof of what your venue looked like before they arrived?
          </p>
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-block">
            Start Your Free 14-Day Trial — No Credit Card Required
          </Link>
        </div>
      </section>

      {/* Catering vertical card */}
      <section className="bg-charcoal-800 border-t border-surface-border py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-400 text-center mb-6">Also available for</h2>
          <div className="max-w-xl mx-auto">
            <div className="card border-gold-400/20 flex flex-col sm:flex-row items-center gap-5">
              <div className="text-4xl flex-shrink-0">🍽️</div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-white text-lg">Caterers</p>
                <p className="text-gray-400 text-sm mt-1">
                  Document your delivery path, equipment inventory, food temps, and setup completion.
                  Protect against venue damage claims. Prove you were on time and food-safe.
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {['Delivery path photos', 'Equipment inventory', 'Food temp compliance', 'Setup timestamp'].map(f => (
                    <span key={f} className="text-xs bg-charcoal-700 text-gray-300 px-2.5 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
              <Link href="/catering" className="btn-primary text-sm flex-shrink-0 whitespace-nowrap">
                Learn More →
              </Link>
            </div>
          </div>
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
              <Link href="/catering" className="hover:text-white">For Caterers</Link>
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
