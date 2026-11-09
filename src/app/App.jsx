import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import Header from '../components/Header.jsx'
import ProductListPage from '../pages/ProductListPage.jsx'
import ProductDetailsPage from '../pages/ProductDetailsPage.jsx'
import styles from './App.module.css'

export default function App() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    const pageName = pathname.startsWith('/products/') ? 'Detalle del producto' : 'Productos'
    document.title = `${pageName} | ITX Mobile`
    mainRef.current?.focus()
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header />
      <main id="contenido" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace state={{ notFound: true }} />} />
        </Routes>
      </main>
    </>
  )
}
