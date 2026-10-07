import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, Settings, LogOut, Menu, Sparkles, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function Layout() {
  const { signOut, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Produk', path: '/products', icon: Package },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ]

  return (
    <div className="relative min-h-screen bg-slate-100/90 dark:bg-zinc-950 text-foreground transition-colors duration-300 selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Ambient Frosted Background Orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[15%] left-[20%] h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-700/20" />
        <div className="absolute top-[35%] -right-[10%] h-[550px] w-[550px] rounded-full bg-rose-500/10 blur-[130px] dark:bg-rose-700/15" />
        <div className="absolute -bottom-[10%] left-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/15 blur-[140px] dark:bg-blue-700/20" />
      </div>

      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Lewati ke Konten Utama
      </a>

      {/* Floating Glassmorphic Header */}
      <div className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="glass-panel rounded-2xl border border-black/10 dark:border-white/15 px-4 md:px-6 h-16 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center gap-6">
            <Link 
              to="/products" 
              className="group flex items-center gap-2.5 rounded-xl px-2 py-1 transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Safwa Fashion Inventory Beranda"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md transition-all group-hover:scale-105">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-foreground">SAFWA</span>
                <span className="text-[10px] -mt-1 font-semibold tracking-wider text-muted-foreground uppercase">Inventory</span>
              </div>
            </Link>
            
            <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1.5 text-sm font-medium ml-4">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] ${
                      isActive 
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm font-semibold' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl h-9 w-9 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.95] transition-all"
              aria-label={`Ubah ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
              title={`Ubah ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-700" aria-hidden="true" />
              )}
            </Button>

            {user?.email && (
              <span className="hidden lg:inline-block text-xs font-mono font-medium text-muted-foreground bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/10">
                {user.email}
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="hidden md:flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-[0.97]"
              aria-label="Keluar dari akun"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold">Keluar</span>
            </Button>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden rounded-xl hover:bg-black/5 dark:hover:bg-white/5" 
                    aria-label="Buka Menu Navigasi"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                }
              />
              <SheetContent side="right" className="glass-panel border-l border-black/10 dark:border-white/15 p-6">
                <SheetHeader className="text-left pb-4 border-b border-border/40">
                  <SheetTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                    Safwa Inventory
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Navigasi Seluler" className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                          isActive 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium shadow-sm' 
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    )
                  })}
                  <div className="pt-4 mt-4 border-t border-border/40">
                    {user?.email && (
                      <p className="text-xs text-muted-foreground px-4 mb-3 truncate font-mono">
                        {user.email}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsOpen(false)
                        signOut()
                      }}
                      className="flex justify-start items-center gap-3 text-destructive hover:bg-destructive/10 rounded-xl px-4 py-2.5 w-full active:scale-[0.98]"
                    >
                      <LogOut className="h-5 w-5" aria-hidden="true" />
                      <span className="text-sm font-medium">Keluar</span>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
