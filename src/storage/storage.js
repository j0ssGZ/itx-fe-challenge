// Each instance falls back to memory for its lifetime after a storage failure.
// JSON serialization isolates cached values from callers' object mutations.
export function createStorage({ getStorage = () => globalThis.localStorage } = {}) {
  const memory = new Map()
  let memoryOnly = false

  function remove(key) {
    memory.delete(key)
    if (!memoryOnly) {
      try {
        getStorage().removeItem(key)
      } catch {
        memoryOnly = true
      }
    }
  }

  return {
    read(key) {
      let raw = memory.get(key) ?? null
      if (!memoryOnly) {
        try {
          raw = getStorage().getItem(key)
          if (raw === null) memory.delete(key)
          else memory.set(key, raw)
        } catch {
          memoryOnly = true
        }
      }
      if (raw === null) return null
      try {
        return JSON.parse(raw)
      } catch {
        remove(key)
        return null
      }
    },
    write(key, value) {
      const raw = JSON.stringify(value)
      memory.set(key, raw)
      if (!memoryOnly) {
        try {
          getStorage().setItem(key, raw)
        } catch {
          memoryOnly = true
        }
      }
    },
    remove,
  }
}
