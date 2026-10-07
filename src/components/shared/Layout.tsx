import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function Layout() {
  const { signOut } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 font-bold tracking-tight rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="InventorySys Home"
            >
              <Package className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>InventorySys</span>
            </Link>
            
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 transition-colors hover:text-foreground/80 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-2 py-1 -mx-2 ${
                      isActive ? 'text-foreground font-semibold' : 'text-foreground/60'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out
            </Button>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle Menu">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                }
              />
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile Navigation" className="flex flex-col gap-4 mt-6">
                  {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 transition-colors hover:text-foreground/80 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-2 py-2 ${
                          isActive ? 'text-foreground font-semibold' : 'text-foreground/60'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-base">{item.name}</span>
                      </Link>
                    )
                  })}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsOpen(false)
                      signOut()
                    }}
                    className="flex justify-start gap-2 text-muted-foreground hover:text-foreground px-2 py-2 mt-2 w-full"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    <span className="text-base">Sign Out</span>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6 md:py-8" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
