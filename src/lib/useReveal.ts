import { useEffect, useRef } from 'react'

// Fades elements with the `reveal` class in the first time they scroll into view.
// Runs after every render, so newly shown cards (after a search or a page change) are picked up too.
export function useReveal() {
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('in')
          observer.current?.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    // Only hide content once we know it will be revealed again.
    document.documentElement.classList.add('reveal-ready')
    return () => observer.current?.disconnect()
  }, [])

  useEffect(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => observer.current?.observe(el))
  })
}
