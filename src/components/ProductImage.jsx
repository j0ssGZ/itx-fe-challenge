import { useState } from 'react'
import styles from './ProductImage.module.css'

export default function ProductImage({ src, alt }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const missing = !src || failedSrc === src

  return (
    <div className={styles.frame}>
      {missing ? (
        <div className={styles.fallback} role="img" aria-label={`Imagen no disponible: ${alt}`}>
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" aria-hidden="true">
            <rect x="5" y="2" width="26" height="44" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M14 7h8M16 40h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Imagen no disponible</span>
        </div>
      ) : (
        <img className={styles.image} src={src} alt={alt} width="240" height="240"
          loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
      )}
    </div>
  )
}
