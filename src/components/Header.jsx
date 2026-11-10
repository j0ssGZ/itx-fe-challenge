import { Link, useMatch } from 'react-router'
import { useCart } from '../app/CartProvider.jsx'
import styles from './Header.module.css'

export default function Header() {
  const { count } = useCart()
  const isDetailsPage = Boolean(useMatch('/products/:id'))

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="ITX Mobile, inicio">ITX Mobile</Link>
        <span className={styles.cart} aria-label={`Carrito: ${count} artículos`}>
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
