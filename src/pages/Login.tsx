import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, ShieldCheck, Sun, Moon } from 'lucide-react'

export function Login() {
  const { session, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
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


  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/70 dark:bg-zinc-950 text-foreground overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] h-[550px] w-[550px] rounded-full bg-violet-400/20 blur-[130px] dark:bg-violet-900/20" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-rose-400/15 blur-[140px] dark:bg-rose-900/15" />
      </div>

      {/* Theme Switcher in Login */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl h-10 w-10 glass-panel border border-black/10 dark:border-white/15 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.95] transition-all shadow-sm"
          aria-label={`Ubah ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
          title={`Ubah ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-700" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center min-h-[calc(100vh-8rem)]">
        {/* Frosted Glass Login Panel */}
        <div className="w-full">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="font-bold text-sm tracking-tight text-foreground">SAFWA ACCESS</span>
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


            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
