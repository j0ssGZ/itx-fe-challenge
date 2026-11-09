import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getProduct } from '../api/products.js'
import ProductImage from '../components/ProductImage.jsx'
import ProductDescription from '../components/ProductDescription.jsx'
import styles from './ProductDetailsPage.module.css'

export default function ProductDetailsPage() {
  const { id } = useParams()
  // Reset request state immediately on ID changes, before the next read effect.
  return <ProductDetails key={id} id={id} />
}

function ProductDetails({ id }) {
  const [request, setRequest] = useState({ status: 'loading', product: null })
  const [attempt, setAttempt] = useState(0)
  const backRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    getProduct(id, { signal: controller.signal }).then(product => {
      if (!controller.signal.aborted) setRequest({ status: 'success', product })
    }).catch(error => {
      if (controller.signal.aborted) return
      const unavailable = ['invalid-response', 'invalid-argument'].includes(error.type)
      setRequest({ status: unavailable ? 'unavailable' : 'error', product: null })
    })
    return () => controller.abort()
  }, [id, attempt])

  function retry() {
    setRequest({ status: 'loading', product: null })
    setAttempt(value => value + 1)
    backRef.current?.focus()
  }

  const { product, status } = request

  return (
    <section aria-labelledby="product-title">
      <Link to="/" ref={backRef} className={styles.back}><span aria-hidden="true">← </span>Volver a productos</Link>
      <p role="status" aria-atomic="true" className={styles.announcement}>
        {status === 'loading' ? 'Cargando el producto…' : status === 'success' ? 'Información del producto cargada.' : ''}
      </p>
      {status === 'success' ? (
        <div className={styles.layout}>
          <div className={styles.imagePanel}>
            <ProductImage key={product.id} src={product.imgUrl} variant="detail"
              alt={[product.brand, product.model].filter(Boolean).join(' ') || 'Dispositivo móvil'} />
          </div>
          <div className={styles.information}>
            <div className={styles.summary}>
              {product.brand && <p className={styles.brand}>{product.brand}</p>}
              <h1 id="product-title" className={styles.title}>{product.model ?? 'Detalle del producto'}</h1>
              <p className={product.price === null ? styles.unavailablePrice : styles.price}>
                {product.price ?? 'Precio no disponible'}
              </p>
            </div>
            <ProductDescription product={product} />
          </div>
        </div>
      ) : (
        <div className={styles.feedback}>
          <h1 id="product-title" className={styles.title}>Detalle del producto</h1>
          {status === 'loading' ? <p aria-hidden="true">Cargando el producto…</p> : (
            <>
              <div role="alert">
                <h2>{status === 'unavailable' ? 'No podemos mostrar este producto' : 'No hemos podido cargar el producto'}</h2>
                <p>{status === 'unavailable'
                  ? 'La información recibida no está disponible. Puedes reintentar o volver al catálogo.'
                  : 'Comprueba tu conexión y vuelve a intentarlo.'}</p>
              </div>
              <button type="button" className={styles.retry} onClick={retry}>Reintentar</button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
