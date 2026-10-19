import { motion } from 'motion/react'

export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ y: 40, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: delay + i * 0.045 }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  )
}
