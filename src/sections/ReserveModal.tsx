import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CashCoin, CreditCard, ExclamationTriangleFill, Whatsapp, XLg } from 'react-bootstrap-icons'
import { SALE_POINTS, TICKETS, type PaymentMethod, type SalePointId } from '../config'
import { supabase } from '../lib/supabase'
import { buildWhatsAppLink, formatMty } from '../lib/whatsapp'

const ORIGINS = [
  { id: 'prepa', label: 'Preparatoria', placeholder: '¿Cuál prepa?' },
  { id: 'amigo', label: 'Amigo de…', placeholder: '¿De quién?' },
  { id: 'conocido', label: 'Conocido de…', placeholder: '¿De quién?' },
  { id: 'otro', label: 'Otro', placeholder: 'Cuéntanos' },
] as const

type OriginId = (typeof ORIGINS)[number]['id']

type Result = { code: string; reservedAt: string; link: string }

const ERRORS: Record<string, string> = {
  taken: 'Ese boleto acaba de ser apartado por alguien más. Elige otro.',
  invalid_name: 'Escribe tu nombre completo.',
  invalid_origin: 'Dinos de dónde vienes.',
}

const field = 'w-full rounded-2xl border-2 border-bark/20 bg-cream px-4 py-3 text-lg text-bark outline-none transition focus:border-orange focus:bg-white focus:ring-4 focus:ring-orange/20'

export function ReserveModal({
  number,
  onClose,
  onReserved,
  online,
}: {
  number: number
  onClose: () => void
  onReserved: (n: number) => void
  online: boolean
}) {
  const [name, setName] = useState('')
  const [originType, setOriginType] = useState<OriginId>('prepa')
  const [originDetail, setOriginDetail] = useState('')
  const [salePoint, setSalePoint] = useState<SalePointId>('garza-laguera')
  const [payment, setPayment] = useState<PaymentMethod>('efectivo')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const origin = `${ORIGINS.find((o) => o.id === originType)!.label.replace('…', '')} ${originDetail}`.trim()
  const point = SALE_POINTS.find((p) => p.id === salePoint)!

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError(ERRORS.invalid_name)
    if (originDetail.trim().length < 2) return setError(ERRORS.invalid_origin)
    setBusy(true)
    let code = `HVN-${String(number).padStart(3, '0')}-DEMO`
    let reservedAt = new Date().toISOString()
    if (supabase) {
      const { data, error: err } = await supabase.rpc('reserve_ticket', {
        p_number: number,
        p_name: name.trim(),
        p_origin: origin,
        p_sale_point: salePoint,
        p_payment_method: payment,
      })
      if (err) {
        setBusy(false)
        const key = Object.keys(ERRORS).find((k) => err.message.includes(k))
        return setError(key ? ERRORS[key] : 'No se pudo reservar. Intenta de nuevo.')
      }
      const row = (data as { code: string; reserved_at: string }[])[0]
      code = row.code
      reservedAt = row.reserved_at
    }
    onReserved(number)
    setResult({
      code,
      reservedAt,
      link: buildWhatsAppLink({ number, code, name: name.trim(), origin, salePoint, payment, reservedAt }),
    })
    setBusy(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-end justify-center bg-bark/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-title"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 80, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="card max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-b-none bg-sun p-6 sm:rounded-b-[1.75rem]"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 id="reserve-title" className="font-display text-5xl text-bark">
              Boleto #{number}
            </h3>
            <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-cream text-bark transition hover:rotate-90 hover:bg-orange hover:text-cream" aria-label="Cerrar">
              <XLg className="size-4" />
            </button>
          </div>

          {!result ? (
            <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1 font-body">
                Nombre completo
                <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoFocus />
              </label>

              <fieldset className="flex flex-col gap-2 font-body">
                <legend className="mb-1">¿De dónde eres?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ORIGINS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOriginType(o.id)}
                      className={`rounded-2xl border-2 border-bark/20 px-2 py-2.5 transition-all hover:-translate-y-0.5 ${originType === o.id ? 'bg-orange text-cream' : 'bg-cream text-bark hover:bg-lime'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <input
                  className={field}
                  value={originDetail}
                  onChange={(e) => setOriginDetail(e.target.value)}
                  placeholder={ORIGINS.find((o) => o.id === originType)!.placeholder}
                  maxLength={100}
                  required
                />
              </fieldset>

              <label className="flex flex-col gap-1 font-body">
                Punto de venta
                <select className={field} value={salePoint} onChange={(e) => setSalePoint(e.target.value as SalePointId)}>
                  {SALE_POINTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} · {p.contact}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="flex flex-col gap-2 font-body">
                <legend className="mb-1">¿Cómo vas a pagar?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['efectivo', 'transferencia'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayment(m)}
                      className={`rounded-2xl border-2 border-bark/20 px-2 py-2.5 transition-all hover:-translate-y-0.5 ${payment === m ? 'bg-lime text-bark' : 'bg-cream text-bark hover:bg-sand'}`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {m === 'efectivo' ? <CashCoin className="size-5" /> : <CreditCard className="size-5" />}
                        {m === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {error && <p className="rounded-2xl border-2 border-rust bg-cream p-3 font-body text-sm text-rust">{error}</p>}

              <button type="submit" disabled={busy} className="btn mt-2 bg-orange text-cream disabled:opacity-60">
                {busy ? 'Apartando…' : `Apartar boleto · $${TICKETS.price}`}
              </button>
              {!online && <p className="text-center font-body text-xs">Modo demo: no se guardará.</p>}
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col gap-4 text-bark">
              <div className="flex items-center gap-3">
                <motion.img
                  src="/media/mascota_haven_2.webp"
                  alt=""
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-24"
                />
                <div>
                  <p className="font-display text-4xl">¡Apartado!</p>
                  <p className="font-body">
                    Folio: <strong>{result.code}</strong>
                  </p>
                  <p className="text-sm">{formatMty(result.reservedAt)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-cream p-4">
                <p className="flex items-center gap-2 font-body text-base text-rust">
                  <ExclamationTriangleFill className="size-5 shrink-0" /> Tu boleto aún no está confirmado.
                </p>
                <p className="mt-1">
                  Manda el mensaje por WhatsApp a <strong>{point.contact}</strong> ({point.label}) para acordar el pago de{' '}
                  <strong>${TICKETS.price} MXN</strong>. Si no se paga, el equipo puede liberar el número.
                </p>
              </div>

              <div className="rounded-2xl bg-cream p-4">
                {payment === 'efectivo' ? (
                  <p className="flex items-start gap-2">
                    <CashCoin className="mt-1 size-5 shrink-0 text-olive" />
                    <span>
                      Pagarás en <strong>efectivo</strong> directamente con {point.contact}.
                    </span>
                  </p>
                ) : (
                  <p className="flex items-start gap-2">
                    <CreditCard className="mt-1 size-5 shrink-0 text-olive" />
                    <span>
                      Pagarás por <strong>transferencia</strong>. {point.contact} te pasará el número por WhatsApp. Envía tu comprobante con el folio {result.code}.
                    </span>
                  </p>
                )}
              </div>

              <a href={result.link} target="_blank" rel="noreferrer" className="btn bg-lime text-center text-bark">
                <Whatsapp className="size-5" /> Enviar mensaje por WhatsApp
              </a>
              <p className="text-center text-xs">{TICKETS.purpose}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
