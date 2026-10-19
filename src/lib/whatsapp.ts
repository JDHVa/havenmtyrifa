import { SALE_POINTS, TICKETS, type PaymentMethod, type SalePointId } from '../config'

export const formatMty = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso))

export function buildWhatsAppLink(input: {
  number: number
  code: string
  name: string
  origin: string
  salePoint: SalePointId
  payment: PaymentMethod
  reservedAt: string
}) {
  const point = SALE_POINTS.find((p) => p.id === input.salePoint)!
  const pay =
    input.payment === 'efectivo'
      ? 'Voy a pagar en efectivo.'
      : '¿Me puedes pasar el número para poder transferir?'
  const text = [
    `Hola ${point.contact}, reservé un boleto para Haven Mty.`,
    '',
    `Boleto: #${input.number}`,
    `Folio: ${input.code}`,
    `Nombre: ${input.name}`,
    `Procedencia: ${input.origin}`,
    `Punto de venta: ${point.label}`,
    `Registro: ${formatMty(input.reservedAt)}`,
    `Monto: $${TICKETS.price} MXN`,
    '',
    pay,
    '',
    TICKETS.purpose,
  ].join('\n')
  return `https://wa.me/${point.phone}?text=${encodeURIComponent(text)}`
}
