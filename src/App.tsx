import { Suspense, lazy, useEffect } from 'react'
import Lenis from 'lenis'
import { Navbar } from './sections/Navbar'
import { Hero } from './sections/Hero'
import { Ribbon } from './sections/Ribbon'
import { About } from './sections/About'
import { Prizes } from './sections/Prizes'
import { Tickets } from './sections/Tickets'
import { HowItWorks } from './sections/HowItWorks'
import { Verify } from './sections/Verify'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { ClickSpark } from './components/ui/ClickSpark'

const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))

function Landing() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ anchors: { offset: -70 } })
    let id = 0
    const raf = (t: number) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <ClickSpark />
      <Navbar />
      <main>
        <Hero />
        <Ribbon />
        <About />
        <Prizes />
        <Tickets />
        <HowItWorks />
        <Verify />
        <Faq />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return window.location.pathname.startsWith('/admin') ? (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  ) : (
    <Landing />
  )
}
