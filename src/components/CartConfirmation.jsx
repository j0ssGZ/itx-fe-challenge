import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { createPortal } from 'react-dom'
import ProductImage from './ProductImage.jsx'
import styles from './CartConfirmation.module.css'

export default function CartConfirmation({ confirmation, count, onDismiss, returnFocusRef }) {
  const dialogRef = useRef(null)
  const { product, color, storage } = confirmation

  useEffect(() => {
    const dialog = dialogRef.current
    const { overflow, paddingRight } = document.body.style
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`
    }
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [])

  function dismiss(restoreFocus = true) {
    dialogRef.current.close()
    if (restoreFocus) returnFocusRef.current?.focus()
    onDismiss()
  }

  function containFocus(event) {
    if (event.key !== 'Tab') return
    const controls = dialogRef.current.querySelectorAll('button, a[href]')
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="confirmation-title"
      aria-describedby="confirmation-description" onKeyDown={containFocus}
      onCancel={event => { event.preventDefault(); dismiss() }}>
      <div className={styles.content}>
        <div className={styles.topline}>
          <span className={styles.eyebrow}><span aria-hidden="true">✓</span> Confirmado</span>
          <button type="button" className={styles.close} onClick={() => dismiss()} aria-label="Cerrar confirmación">✕</button>
        </div>
        <h2 id="confirmation-title">Producto añadido.</h2>
        <p id="confirmation-description" className={styles.description}>Tu selección se ha añadido correctamente.</p>
        <div className={styles.product}>
          <div className={styles.image}>
            <ProductImage src={product.imgUrl} alt={[product.brand, product.model].filter(Boolean).join(' ') || 'Dispositivo móvil'} />
          </div>
          <div className={styles.identity}>
            {product.brand && <p className={styles.brand}>{product.brand}</p>}
            <h3>{product.model ?? 'Dispositivo móvil'}</h3>
          </div>
        </div>
        <dl className={styles.options}>
          <div><dt>Color</dt><dd>{color}</dd></div>
          <div><dt>Almacenamiento</dt><dd>{storage}</dd></div>
        </dl>
        <div className={styles.count}>
          <p>Último contador confirmado</p><strong>{count}</strong>
          <span>Último valor confirmado. No representa un desglose del carrito.</span>
        </div>
        <div className={styles.footer}>
          <Link to="/" className={styles.continue} onClick={() => dismiss(false)}>Seguir comprando <span aria-hidden="true">↗</span></Link>
          <button type="button" className={styles.dismiss} onClick={() => dismiss()}>Cerrar</button>
        </div>
      </div>
    </dialog>, document.body
  )
}
