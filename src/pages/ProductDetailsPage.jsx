import { Link, useParams } from 'react-router'
import styles from './Placeholder.module.css'

export default function ProductDetailsPage() {
  const { id } = useParams()

  return (
    <section className={styles.panel} aria-labelledby="product-title">
      <h1 id="product-title">Detalle del producto</h1>
      <p>Las características del dispositivo estarán disponibles próximamente.</p>
      <p>Referencia: <code>{id}</code></p>
      <Link to="/" className={styles.link}>Volver a productos</Link>
    </section>
  )
}
