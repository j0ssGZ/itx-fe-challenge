import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { getProducts } from '../api/products.js'
import ProductCard from '../components/ProductCard.jsx'
import styles from './ProductListPage.module.css'

export default function ProductListPage() {
  const { state } = useLocation()
  const [request, setRequest] = useState({ status: 'loading', products: [] })
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    getProducts({ signal: controller.signal }).then(products => {
      if (!controller.signal.aborted) setRequest({ status: 'success', products })
    }).catch(() => {
      if (!controller.signal.aborted) setRequest({ status: 'error', products: [] })
    })
    return () => controller.abort()
  }, [attempt])

  const search = query.trim().toLowerCase()
  const filteredProducts = request.products.filter(product =>
    !search || [product.brand, product.model].some(value => value?.toLowerCase().includes(search)),
  )
  let announcement = 'Cargando productos…'
  if (request.status === 'error') announcement = ''
  if (request.status === 'success') {
    announcement = request.products.length === 0 ? 'No hay productos disponibles en este momento.'
      : filteredProducts.length === 0 ? 'No hay productos que coincidan con tu búsqueda.'
        : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto' : 'productos'}`
  }

  function clearSearch() {
    setQuery('')
    searchRef.current?.focus()
  }

  function retry() {
    setRequest({ status: 'loading', products: [] })
    setAttempt(value => value + 1)
    searchRef.current?.focus()
  }

  return (
    <section aria-labelledby="products-title">
      {state?.notFound && <p className={styles.notice} role="status">Página no encontrada. Te mostramos el inicio.</p>}
      <div className={styles.toolbar}>
        <div>
          <h1 id="products-title" className={styles.title}>Productos</h1>
          <p className={styles.intro}>Explora el catálogo de dispositivos móviles.</p>
        </div>
        <search className={styles.search} aria-label="Buscar en el catálogo">
          <label htmlFor="product-search">Buscar por marca o modelo</label>
          <div className={styles.searchControl}>
            <input id="product-search" ref={searchRef} type="search" placeholder="Marca o modelo"
              value={query} onChange={event => setQuery(event.target.value)} aria-describedby="product-results" />
            <button type="button" onClick={clearSearch} disabled={!query} aria-label="Limpiar búsqueda">Limpiar</button>
          </div>
        </search>
      </div>
      <p id="product-results" role="status" aria-atomic="true" className={styles.results}>{announcement}</p>
      {request.status === 'error' && (
        <div className={styles.feedback}>
          <div role="alert">
            <h2>No hemos podido cargar los productos</h2>
            <p>Comprueba tu conexión y vuelve a intentarlo.</p>
          </div>
          <button type="button" className={styles.retry} onClick={retry}>Reintentar</button>
        </div>
      )}
      {request.status === 'success' && request.products.length > 0 && filteredProducts.length === 0 && (
        <div className={styles.feedback}>
          <h2>Prueba con otra búsqueda</h2>
          <p>Busca una parte de la marca o del modelo.</p>
          <button type="button" className={styles.retry} onClick={clearSearch}>Mostrar todos los productos</button>
        </div>
      )}
      {request.status === 'success' && filteredProducts.length > 0 && (
        <ul className={styles.grid} aria-label="Catálogo de productos">
          {filteredProducts.map(product => <li key={product.id}><ProductCard product={product} /></li>)}
        </ul>
      )}
    </section>
  )
}
