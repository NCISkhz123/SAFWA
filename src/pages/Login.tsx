import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, AlertCircle, Loader2, KeyRound, ShieldCheck, Tag, TrendingUp } from 'lucide-react'

export function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return null

  if (session) {
    return <Navigate to="/products" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
    }
    setIsSubmitting(false)
  }

  const handleQuickFill = () => {
    setEmail('admin@safwa.com')
    setPassword('password123')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/70 dark:bg-zinc-950 text-foreground overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] h-[550px] w-[550px] rounded-full bg-violet-400/20 blur-[130px] dark:bg-violet-900/20" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-rose-400/15 blur-[140px] dark:bg-rose-900/15" />
      </div>

      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Side: Bento Grid Showcase */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bento Tile 1: Hero Showcase */}
          <div className="sm:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg relative overflow-hidden bento-glow-purple">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Fashion Inventory Suite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
              Kelola Koleksi Fashion dengan Presisi & Kecepatan Tinggi.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              Sistem inventaris cerdas untuk katalog pakaian, kalkulasi otomatis margin laba, dan penomoran kode produk atomic anti-bentrok.
            </p>
          </div>

          {/* Bento Tile 2: Auto Code Feature */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3 border border-blue-500/20">
              <Tag className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-sm text-foreground block">Atomic SKU Codes</span>
              <p className="text-xs text-muted-foreground mt-1">
                Format otomatis berbasis kategori seperti <code className="text-[11px] font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">KM001</code> tanpa duplikasi.
              </p>
            </div>
          </div>

          {/* Bento Tile 3: Margin & Profit */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-sm text-foreground block">Pelacak Margin Laba</span>
              <p className="text-xs text-muted-foreground mt-1">
                Transparansi harga supplier, harga pasaran, dan biaya promosi untuk profit maksimal.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Login Panel */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="font-bold text-sm tracking-tight">SAFWA ACCESS</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Masuk ke Akun</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Gunakan kredensial admin Anda untuk membuka dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-4">
              {error && (
                <div 
                  className="rounded-2xl bg-destructive/15 border border-destructive/20 p-3.5 flex items-start gap-2.5 text-xs text-destructive font-medium" 
                  role="alert" 
                  aria-live="assertive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@safwa.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isSubmitting}
                  aria-invalid={!!error}
                  className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kata Sandi
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-invalid={!!error}
                  className="rounded-xl glass-input h-11 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Sedang Masuk...
                  </>
                ) : (
                  'Masuk ke Akun'
                )}
              </Button>

              {/* Quick Demo Credentials Autofill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-black/[0.02] dark:bg-white/[0.02] text-xs text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <KeyRound className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  <span>Isi otomatis akun demo (admin@safwa.com)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
