import { SALE_POINTS, TICKETS, type PaymentMethod, type SalePointId } from '../config'
import { orderTotal } from './pricing'

export const formatMty = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso))

export function buildWhatsAppLink(input: {
  tickets: { number: number; code: string }[]
  groupCode: string | null
  name: string
  origin: string
  salePoint: SalePointId
  payment: PaymentMethod
  reservedAt: string
}) {
  const point = SALE_POINTS.find((p) => p.id === input.salePoint)!
  const many = input.tickets.length > 1
  const total = orderTotal(input.tickets.length)
  const pay =
    input.payment === 'efectivo'
      ? 'Voy a pagar en efectivo.'
      : '¿Me puedes pasar el número para poder transferir?'
  const text = [
    many
      ? `Hola ${point.contact}, reservé ${input.tickets.length} boletos para Haven Mty (promo ${TICKETS.promo.qty}x$${TICKETS.promo.price}).`
      : `Hola ${point.contact}, reservé un boleto para Haven Mty.`,
    '',
    `${many ? 'Boletos' : 'Boleto'}: ${input.tickets.map((t) => `#${t.number}`).join(', ')}`,
    `${many ? 'Folios' : 'Folio'}: ${input.tickets.map((t) => t.code).join(', ')}`,
    ...(input.groupCode ? [`Paquete: ${input.groupCode}`] : []),
    `Nombre: ${input.name}`,
    `Procedencia: ${input.origin}`,
    `Punto de venta: ${point.label}`,
    `Registro: ${formatMty(input.reservedAt)}`,
    `Monto: $${total} MXN`,
    '',
    pay,
    '',
    TICKETS.purpose,
  ].join('\n')
  return `https://wa.me/${point.phone}?text=${encodeURIComponent(text)}`
}
