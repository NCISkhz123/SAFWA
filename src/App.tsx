import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { Layout } from '@/components/shared/Layout'
import { ProtectedRoute, AdminRoute } from '@/components/shared/ProtectedRoute'
import { Settings } from '@/pages/Settings'
import { ProductList } from '@/pages/ProductList'
import { ProductFormPage } from '@/pages/ProductFormPage'
import EditProductPage from '@/pages/EditProductPage'
import { ThemeProvider } from '@/hooks/useTheme'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductList />} />
              <Route element={<AdminRoute />}>
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id/edit" element={<EditProductPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
