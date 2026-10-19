const ITEMS = ['Hack Club', 'Haven MTY', '14 y 15 de noviembre', 'Apoya el evento', 'Reserva tu boleto', 'Construye cosas chidas']

function Row({ reverse, className }: { reverse?: boolean; className: string }) {
  const list = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS]
  return (
    <div className={`overflow-hidden py-3 ${className}`}>
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-3xl sm:text-4xl" style={reverse ? { animationDirection: 'reverse' } : undefined}>
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="inline-block animate-spin-slow text-2xl">✿</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Ribbon() {
  return (
    <div className="relative z-20 -my-6 overflow-hidden py-8" aria-hidden>
      <Row className="-rotate-2 bg-orange text-cream shadow-xl" />
      <Row reverse className="-mt-4 rotate-1 bg-lime text-bark shadow-xl" />
    </div>
  )
}
