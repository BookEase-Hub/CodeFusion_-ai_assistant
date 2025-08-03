export function get(key: string): Promise<any> {
  return new Promise((resolve) => {
    const request = self.indexedDB.open("codefusion-db", 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore("keyval")
    }

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction("keyval", "readonly")
      const store = tx.objectStore("keyval")
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(undefined)
    }

    request.onerror = () => resolve(undefined)
  })
}

export function set(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    const request = self.indexedDB.open("codefusion-db", 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore("keyval")
    }

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction("keyval", "readwrite")
      const store = tx.objectStore("keyval")
      store.put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve() // TODO: handle error
    }

    request.onerror = () => resolve() // TODO: handle error
  })
}

export function del(key: string): Promise<void> {
  return new Promise((resolve) => {
    const request = self.indexedDB.open("codefusion-db", 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore("keyval")
    }

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction("keyval", "readwrite")
      const store = tx.objectStore("keyval")
      store.delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve() // TODO: handle error
    }

    request.onerror = () => resolve() // TODO: handle error
  })
}
