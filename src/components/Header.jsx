import { Link, useMatch } from 'react-router'
import { useCart } from '../app/CartProvider.jsx'
import styles from './Header.module.css'

export default function Header() {
  const { count } = useCart()
  const isDetailsPage = Boolean(useMatch('/products/:id'))

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="ITX Mobile, inicio">
          <span className={styles.brandMark} aria-hidden="true">i.</span>ITX <span className={styles.brandLight}>Mobile</span>
        </Link>
        <span className={styles.cart} aria-label={`Carrito: ${count} artículos`} aria-live="polite" aria-atomic="true">
          <svg width="18" height="20" viewBox="0 0 20 22" fill="none" aria-hidden="true">
            <path d="M3 7h14l1 13H2L3 7Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 8V5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          Carrito <strong>{count}</strong>
        </span>
        <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
          <ol>
            <li>
              {isDetailsPage ? <Link to="/">Productos</Link> : <span aria-current="page">Productos</span>}
            </li>
            {isDetailsPage && <li><span aria-current="page">Detalle del producto</span></li>}
          </ol>
        </nav>
      </div>
    </header>
  )
}
