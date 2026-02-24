import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import App from './App.jsx'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Parallax + scroll reveal
function initScrollEffects() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el))

  // Parallax on scroll
  window.addEventListener('scroll', () => {
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.3
      const rect = el.getBoundingClientRect()
      const offset = (rect.top - window.innerHeight / 2) * speed
      el.style.transform = `translateY(${offset}px)`
    })
  }, { passive: true })
}

// Init after DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollEffects)
} else {
  setTimeout(initScrollEffects, 100)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
