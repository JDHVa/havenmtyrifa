import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { EVENT } from '../config'

const LINKS = [
  ['Haven', '#haven'],
  ['Premios', '#premios'],
  ['Boletos', '#boletos'],
  ['Verificar', '#verificar'],
  ['FAQ', '#faq'],
]

export function Navbar() {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  const bg = useTransform(scrollY, [0, 160], ['rgba(255,248,230,0)', 'rgba(255,248,230,0.85)'])
  const shadow = useTransform(scrollY, [0, 160], ['0 0 0 rgba(0,0,0,0)', '0 10px 30px -15px rgba(120,61,43,.5)'])
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3"
    >
      <motion.nav
        style={{ backgroundColor: bg, boxShadow: shadow }}
        className="relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-full px-4 py-2 backdrop-blur-md"
      >
        <a href="#top" className="flex items-center gap-2">
          <img src="/media/mascota_haven.webp" alt="" className="size-9 animate-wiggle" />
          <span className="font-display text-2xl text-bark">Haven MTY</span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="group relative rounded-full px-4 py-2 text-lg text-bark transition-colors hover:text-cream">
              <span className="absolute inset-0 scale-50 rounded-full bg-orange opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
              <span className="relative">{label}</span>
            </a>
          ))}
        </div>
        <a href={EVENT.registerUrl} target="_blank" rel="noreferrer" className="btn bg-lime !px-4 !py-2 !text-base text-bark">
          Regístrate
        </a>
        <motion.span style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r from-lime via-sun to-orange" />
      </motion.nav>
    </motion.header>
  )
}
