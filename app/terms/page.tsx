import Link from 'next/link'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | VenueProof',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-charcoal-900 text-white">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-charcoal-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-gold-400" />
            <span className="text-xl font-bold text-white">VenueProof</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: April 17, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Ashward Group LLC
              ("Company," "we," "us," or "our") governing your access to and use of VenueProof, available at
              venueproof.io (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
              If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-gray-400 leading-relaxed">
              VenueProof is an event venue deposit protection and condition documentation platform. It enables venue
              managers and event professionals to document venue condition before and after events using photos, voice
              observations, and AI-generated comparison reports. The Service is intended to support damage deposit
              documentation, insurance claims, and professional client communication. VenueProof and its AI-generated
              reports do not constitute legal advice. Nothing in the Service should be relied upon as a legal
              conclusion — consult a qualified attorney for legal matters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Subscriptions and Billing</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              VenueProof is offered on a monthly subscription basis. By subscribing, you authorize Ashward Group LLC
              to charge your payment method on a recurring monthly basis until you cancel.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Auto-Renewal:</strong> Subscriptions automatically renew each
                billing period at the then-current rate. No separate renewal notice is sent. You are responsible
                for canceling before the renewal date if you wish to discontinue.
              </li>
              <li>
                <strong className="text-gray-300">Free Trial:</strong> New accounts receive a 14-day free trial with
                no credit card required. If a payment method is added and the trial is not canceled, the subscription
                begins automatically at trial end.
              </li>
              <li>
                <strong className="text-gray-300">Cancellation:</strong> Cancel anytime from your billing settings.
                Access continues through the end of the current paid period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Refund Policy</h2>
            <p className="text-gray-400 leading-relaxed">
              All subscription fees are non-refundable. We do not provide refunds or credits for partial billing
              periods, unused features, or unused access. If you believe you were charged in error, contact us at{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-gold-400 hover:underline">
                joel@ashwardgroup.com
              </a>{' '}
              within 30 days of the charge for review.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. AI-Generated Condition Reports</h2>
            <p className="text-gray-400 leading-relaxed">
              VenueProof uses AI (Anthropic Claude) to structure and analyze walkthrough data and generate
              before/after comparison reports. These reports are tools to support documentation — they are not
              legal determinations, expert assessments, or insurance adjudications. The accuracy of any report
              depends on the quality and completeness of data you input. Ashward Group LLC makes no warranty
              regarding the sufficiency of any VenueProof report for legal, insurance, or arbitration purposes.
              You are solely responsible for how you use reports generated by the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p className="text-gray-400 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Upload content that is fraudulent, defamatory, obscene, or infringes third-party rights</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service</li>
              <li>Resell or sublicense access to the Service without our written permission</li>
              <li>Create false or misleading documentation records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p className="text-gray-400 leading-relaxed">
              The Service, its design, code, and content are owned by Ashward Group LLC and protected by applicable
              intellectual property laws. You retain ownership of your data (photos, venue records, event reports)
              and grant Ashward Group LLC a limited license to store and process that data solely to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-gray-400 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. ASHWARD GROUP LLC DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR
              ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p className="text-gray-400 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ASHWARD GROUP LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, FAILED DEPOSIT
              CLAIMS, OR UNFAVORABLE LEGAL OUTCOMES. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE
              AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
            <p className="text-gray-400 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms or
              for any other reason at our sole discretion. Upon termination, your right to access the Service ceases
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Governing Law and Disputes</h2>
            <p className="text-gray-400 leading-relaxed">
              These Terms are governed by the laws of the State of Oregon, without regard to conflict of law
              provisions. Any disputes shall be resolved exclusively in the state or federal courts located in Oregon,
              and you consent to personal jurisdiction in those courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              We may update these Terms periodically. Continued use of the Service after changes constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              Questions about these Terms:{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-gold-400 hover:underline">
                joel@ashwardgroup.com
              </a>
              <br />
              Ashward Group LLC
            </p>
          </section>

        </div>
      </main>

      <footer className="bg-charcoal-900 border-t border-surface-border py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 Ashward Group LLC. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
