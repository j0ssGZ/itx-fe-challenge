import { useEffect, useRef, useState } from 'react'
import { addToCart } from '../api/cart.js'
import { useCart } from '../app/CartProvider.jsx'
import CartConfirmation from './CartConfirmation.jsx'
import styles from './ProductActions.module.css'

export default function ProductActions({ product }) {
  const { colors, storages } = product.options
  const [colorCode, setColorCode] = useState(() => colors.length === 1 ? colors[0].code : null)
  const [storageCode, setStorageCode] = useState(() => storages.length === 1 ? storages[0].code : null)
  const [status, setStatus] = useState('idle')
  const [confirmation, setConfirmation] = useState(null)
  const addRef = useRef(null)
  const submitting = useRef(false)
  const mounted = useRef(false)
  const { beginAdd, confirmCount } = useCart()
  const valid = colors.some(option => option.code === colorCode) && storages.some(option => option.code === storageCode)
  const missing = colors.length === 0 || storages.length === 0

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  async function submit(event) {
    event.preventDefault()
    if (!valid || submitting.current) return
    submitting.current = true
    const addId = beginAdd()
    setStatus('pending')
    try {
      // Do not abort/replay mutations on navigation: the server may already add it.
      const { count } = await addToCart({ id: product.id, colorCode, storageCode })
      confirmCount(count, addId)
      if (mounted.current) {
        setStatus('success')
        setConfirmation({ product, color: colors.find(option => option.code === colorCode).name,
          storage: storages.find(option => option.code === storageCode).name })
      }
    } catch {
      if (mounted.current) setStatus('error')
    } finally {
      submitting.current = false
    }
  }

  function options(label, name, items, selected, select) {
    return (
      <fieldset disabled={status === 'pending'}>
        <legend>{label}</legend>
        <div className={styles.choices}>
          {items.map((option, index) => (
            <label className={styles.choice} key={`${option.code}-${index}`}>
              <input type="radio" name={name} value={option.code} checked={selected === option.code}
                required onChange={() => { select(option.code); setStatus('idle') }} />
              <span>{option.name}</span>
            </label>
          ))}
        </div>
        {items.length === 0 && <p>No disponible</p>}
      </fieldset>
    )
  }

  return (
    <section className={styles.actions} aria-labelledby="actions-title">
      <h2 id="actions-title">Opciones del producto</h2>
      <form onSubmit={submit} aria-describedby="selection-help">
        {options('Color', 'color', colors, colorCode, setColorCode)}
        {options('Almacenamiento', 'storage', storages, storageCode, setStorageCode)}
        <p id="selection-help" className={styles.help}>
          {missing ? 'No hay opciones válidas suficientes para añadir este producto.'
            : 'Selecciona un color y una capacidad de almacenamiento para añadir el producto.'}
        </p>
        <button ref={addRef} type="submit" disabled={!valid || status === 'pending'}>
          {status === 'pending' ? 'Añadiendo…' : 'Añadir'}
        </button>
        <p role="status" aria-atomic="true" className={styles.message}>
          {status === 'pending' ? 'Añadiendo el producto…' : ''}
        </p>
        {status === 'error' && <p role="alert" className={styles.error}>
          No hemos podido confirmar la operación. El contador anterior se conserva. Comprueba tu conexión antes de volver a intentarlo.
        </p>}
      </form>
      {confirmation && <CartConfirmation confirmation={confirmation}
        returnFocusRef={addRef} onDismiss={() => setConfirmation(null)} />}
    </section>
  )
}
