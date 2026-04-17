import Link from 'next/link'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | VenueProof',
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: April 17, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p className="text-gray-400 leading-relaxed">
              Ashward Group LLC ("we," "us," or "our") operates VenueProof (venueproof.io). This Privacy Policy
              describes what data we collect, how we use it, and the rights you have regarding that data. By using
              VenueProof, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>

            <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">Account Information</h3>
            <p className="text-gray-400 leading-relaxed">
              When you create an account, we collect your name, email address, business name, and billing
              information (processed by Stripe — we do not store raw card numbers).
            </p>

            <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">Venue Condition Snapshots</h3>
            <p className="text-gray-400 leading-relaxed">
              During event walkthroughs, you create condition snapshots for each venue zone. These snapshots
              contain photos you upload and text observations. Snapshots are stored and associated with the
              specific event and walkthrough type (pre-event or post-event).
            </p>

            <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">Photos</h3>
            <p className="text-gray-400 leading-relaxed">
              Photos captured during walkthroughs are uploaded and stored in our cloud storage (Supabase).
              Photos are sent to Anthropic's Claude API for AI-powered condition analysis and comparison.
              We do not use your photos to train AI models, and photos are not shared with third parties
              beyond Anthropic for analysis purposes.
            </p>

            <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">Voice-to-Text Transcripts</h3>
            <p className="text-gray-400 leading-relaxed">
              VenueProof uses the browser's built-in Web Speech API for voice observation input. Voice
              processing happens entirely within your browser — no audio is transmitted to our servers or
              any third party. Only the resulting text transcript is stored on our servers as part of
              your walkthrough record.
            </p>

            <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">Event Records</h3>
            <p className="text-gray-400 leading-relaxed">
              We store event records including event name, type, date, associated venue, and the structured
              condition data from your walkthroughs. AI-generated comparison reports are stored and linked
              to the event record.
            </p>

            <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">Usage Data</h3>
            <p className="text-gray-400 leading-relaxed">
              We collect standard server logs including IP addresses, browser type, and pages visited for
              security and performance monitoring. This data is not sold or used for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>To provide and operate the VenueProof service</li>
              <li>To generate AI-powered condition comparisons and event reports</li>
              <li>To process payments and manage your subscription</li>
              <li>To send transactional emails (account confirmation, billing receipts)</li>
              <li>To troubleshoot issues and improve the Service</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-3">
              We do not sell your data. We do not use your data for behavioral advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              VenueProof relies on the following third-party providers. Each has its own privacy practices:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Supabase</strong> — Database, file storage, and authentication.
                Data is stored in Supabase-managed infrastructure. See{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
                  supabase.com/privacy
                </a>.
              </li>
              <li>
                <strong className="text-gray-300">Stripe</strong> — Payment processing. Stripe handles all billing
                data and is PCI-DSS compliant. See{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
                  stripe.com/privacy
                </a>.
              </li>
              <li>
                <strong className="text-gray-300">Anthropic</strong> — AI condition analysis and report structuring
                via the Claude API. Walkthrough photos and text are sent to Anthropic for processing. See{' '}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
                  anthropic.com/privacy
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p className="text-gray-400 leading-relaxed">
              We retain your account data and event records for as long as your account is active. After account
              cancellation, data is retained for 90 days to allow for recovery, then permanently deleted.
              This includes all photos, event records, condition snapshots, and AI-generated reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="text-gray-400 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong className="text-gray-300">Access</strong> — Request a copy of the data we hold about you</li>
              <li><strong className="text-gray-300">Correction</strong> — Request correction of inaccurate data</li>
              <li><strong className="text-gray-300">Deletion</strong> — Request deletion of your account and all associated data</li>
              <li><strong className="text-gray-300">Portability</strong> — Request your data in a machine-readable format</li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:joel@ashwardgroup.com" className="text-gold-400 hover:underline">
                joel@ashwardgroup.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Security</h2>
            <p className="text-gray-400 leading-relaxed">
              We use HTTPS encryption, row-level database security, and access controls to protect your data.
              No transmission method is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Children's Privacy</h2>
            <p className="text-gray-400 leading-relaxed">
              VenueProof is not directed at children under 13 and we do not knowingly collect data from children
              under 13. Contact us if you believe we have done so inadvertently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-400 leading-relaxed">
              We may update this Privacy Policy periodically. The "Last updated" date reflects the most recent
              revision. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              Privacy questions or data requests:{' '}
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
