import styles from './ProductDescription.module.css'

// Values have already been validated and normalized by the M03 API boundary.
export default function ProductDescription({ product }) {
  const attributes = [
    ['Marca', product.brand],
    ['Modelo', product.model],
    ['Precio', product.price ?? 'Precio no disponible'],
    ['CPU', product.cpu],
    ['RAM', product.ram],
    ['Sistema operativo', product.os],
    ['Resolución de pantalla', product.displaySize],
    ['Batería', product.battery],
    ['Cámaras', (
      <div className={styles.cameras}>
        <p><span>Principal: </span>{product.primaryCamera ?? 'No disponible'}</p>
        <p><span>Secundaria: </span>{product.secondaryCmera ?? 'No disponible'}</p>
      </div>
    )],
    ['Dimensiones', product.dimentions],
    ['Peso', product.weight],
  ]

  return (
    <section aria-labelledby="specifications-title" className={styles.description}>
      <h2 id="specifications-title">Especificaciones</h2>
      <dl>
        {attributes.map(([label, value]) => (
          <div className={styles.row} key={label}>
            <dt>{label}</dt>
            <dd>{value ?? 'No disponible'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
