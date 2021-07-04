import { useRef } from 'react'

let uniqueId = 0
const getUniqueId = () => uniqueId++

export function ElementId(prefix: string) {
  const idRef = useRef(getUniqueId())
  return prefix + idRef.current
}
