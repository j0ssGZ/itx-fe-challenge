import { Link } from 'react-router'
import ProductImage from './ProductImage.jsx'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const brand = product.brand ?? 'Marca no disponible'
  const model = product.model ?? 'Modelo no disponible'
  const name = `${brand} ${model}`

  return (
    <Link to={`/products/${encodeURIComponent(product.id)}`} className={styles.card}
      aria-label={`Ver detalle de ${name}`}>
      <ProductImage src={product.imgUrl} alt={name} />
      <div className={styles.content}>
        <p className={styles.brand}>{brand}</p>
        <h2 className={styles.model}>{model}</h2>
        <p className={product.price === null ? styles.unavailable : styles.price}>
          {product.price ?? 'Precio no disponible'}
        </p>
        <span className={styles.details} aria-hidden="true">Ver producto <span>→</span></span>
      </div>
    </Link>
  )
}
