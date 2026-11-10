import { useState } from 'react'
import styles from './ProductImage.module.css'

export default function ProductImage({ src, alt, variant = 'card' }) {
  const [image, setImage] = useState(null)
  const current = image?.src === src ? image : null
  const missing = !src || current?.status === 'error'
  const loading = !missing && current?.status !== 'loaded'

  return (
    <div className={`${styles.frame} ${variant === 'detail' ? styles.detail : ''}`}>
      {missing ? (
        <div className={styles.fallback} role="img" aria-label={`Imagen no disponible: ${alt}`}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="4" y="5" width="32" height="30" rx="6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="14" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="m5 29 9-8 7 6 6-5 8 7M8 36 34 4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>Imagen no disponible</span>
          <small>Consulta los detalles del producto.</small>
        </div>
      ) : (
        <>
          {loading && <span className={styles.loading} aria-hidden="true">Cargando imagen…</span>}
          <img className={`${styles.image} ${loading ? styles.pending : ''}`} src={src} alt={alt} width="240" height="240"
            style={current?.status === 'loaded' ? { maxWidth: current.width * 1.5, maxHeight: current.height * 1.5 } : undefined}
            loading="lazy" decoding="async" onError={() => setImage({ src, status: 'error' })}
            onLoad={event => setImage({ src, status: 'loaded', width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight })} />
        </>
      )}
    </div>
  )
}
