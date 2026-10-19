export const EVENT = {
  name: 'Haven Monterrey',
  dates: '14 y 15 de noviembre',
  start: '2026-11-14T09:00:00-06:00',
  registerUrl: 'https://haven.hackclub.com/monterrey#top',
}

export const TICKETS = {
  total: 200,
  price: 150,
  purpose: 'Los boletos son para apoyar la realización del evento Haven Mty.',
}

export type SalePointId = 'garza-laguera' | 'cumbres' | 'eiao' | 'ajeno'

export const SALE_POINTS: { id: SalePointId; label: string; contact: string; phone: string }[] = [
  { id: 'garza-laguera', label: 'PrepaTec Garza Laguera', contact: 'Anna Antunez', phone: '5218124430879' },
  { id: 'cumbres', label: 'PrepaTec Cumbres', contact: 'Edson', phone: '5218121747721' },
  { id: 'eiao', label: 'EIAO', contact: 'Jesus', phone: '5218128926313' },
  { id: 'ajeno', label: 'Ajeno', contact: 'Edson', phone: '5218121747721' },
]

export type PaymentMethod = 'efectivo' | 'transferencia'

export const PRIZES = [
  {
    name: 'Drone Visuo XS809HW',
    detail: 'Con cámara HD para grabar desde el cielo.',
    url: 'https://www.mercadolibre.com.mx/drone-visuo-xs809hw-con-camara-hd-negro-1-bateria/p/MLM9394556',
    image: '/media/drone_visuo.webp',
    tag: '1er premio',
  },
  {
    name: 'DJI Osmo Mobile 8',
    detail: 'Estabilizador para tu smartphone.',
    url: 'https://www.liverpool.com.mx/tienda/pdp/Estabilizador-compatible-con-smartphone-DJI-modelo-Osmo-Mobile-8/1187930398',
    image: '/media/osmo_mobile_8.webp',
    tag: '2do premio',
  },
  {
    name: '3 tarjetas Amazon',
    detail: 'Tres ganadores de $500 MXN cada una.',
    url: 'https://www.amazon.com.mx/',
    image: '/media/tarjetas_de_500.webp',
    tag: '×3',
  },
  {
    name: 'Peluche Chiikawa',
    detail: 'Súper suavecito y abrazable.',
    url: 'https://www.miniso.com.mx/peluche-chiikawa-usagi-felpa-amarillo-17x28-cm/p?idsku=41614',
    image: '/media/chikawa_plushie.webp',
    tag: 'kawaii',
  },
] as const
