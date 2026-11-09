import { Link, useLocation } from 'react-router'
import styles from './Placeholder.module.css'

export default function ProductListPage() {
  const { state } = useLocation()

  return (
    <section className={styles.panel} aria-labelledby="products-title">
      {state?.notFound && <p role="status">Página no encontrada. Te mostramos el inicio.</p>}
      <h1 id="products-title">Productos</h1>
      <p>Estamos preparando el catálogo de dispositivos móviles.</p>
      <Link to="/products/ejemplo" className={styles.link}>Ver detalle de ejemplo</Link>
    </section>
  )
}
