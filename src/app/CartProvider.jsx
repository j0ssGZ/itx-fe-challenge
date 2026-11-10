import { createContext, useCallback, useContext, useState } from 'react'
import { createCartCountStorage } from '../storage/cartCount.js'

const CartContext = createContext(null)

export default function CartProvider({ children }) {
  const [storage] = useState(() => createCartCountStorage())
  const [count, setCount] = useState(() => storage.read())
  const confirmCount = useCallback(value => {
    if (storage.write(value)) setCount(value)
  }, [storage])

  return <CartContext.Provider value={{ count, confirmCount }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
