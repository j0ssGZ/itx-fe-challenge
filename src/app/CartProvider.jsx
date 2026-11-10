import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createCartCountStorage } from '../storage/cartCount.js'

const CartContext = createContext(null)

export default function CartProvider({ children }) {
  const [storage] = useState(() => createCartCountStorage())
  const [count, setCount] = useState(() => storage.read())
  const nextAdd = useRef(0)
  const lastConfirmedAdd = useRef(0)
  const beginAdd = useCallback(() => ++nextAdd.current, [])
  const confirmCount = useCallback((value, addId) => {
    // A late reply from an older form must not replace a newer confirmed add.
    if (addId < lastConfirmedAdd.current) return
    if (storage.write(value)) {
      lastConfirmedAdd.current = addId
      setCount(value)
    }
  }, [storage])

  return <CartContext.Provider value={{ count, beginAdd, confirmCount }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
