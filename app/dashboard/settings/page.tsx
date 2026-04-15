'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email ?? '')
      setLoading(false)
    }
    load()
  }, [router])

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ email })
    if (err) setError(err.message)
    else setSaved(true)
    setSaving(false)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setPwSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) setError(err.message)
    else { setPwSaved(true); setNewPassword('') }
    setPwSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Account Settings</h1>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={saveEmail} className="card space-y-4">
        <h2 className="font-semibold text-white">Email Address</h2>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Update Email'}
        </button>
      </form>

      <form onSubmit={savePassword} className="card space-y-4">
        <h2 className="font-semibold text-white">Change Password</h2>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" placeholder="Minimum 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} required />
        </div>
        <button type="submit" disabled={pwSaving} className="btn-secondary flex items-center gap-2">
          {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {pwSaved ? 'Password Updated!' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
