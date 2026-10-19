# Haven Monterrey — sitio web

Landing para promocionar **Haven MTY** (Hack Club) y reservar boletos de una rifa cuyo fin es **apoyar la realización del evento Haven Mty**. El sorteo NO ocurre en el sitio.

## Reglas
- **Prohibido escribir comentarios en el código** (ni `//`, ni `/* */`, ni `{/* */}`, ni `<!-- -->`).
- Textos de UI en español (México).
- Animaciones inspiradas en React Bits (https://reactbits.dev) y Watermelon UI (https://ui.watermelon.sh), implementadas con Motion en `src/components/ui`.
- Respetar `prefers-reduced-motion` y diseño mobile-first.
- Datos configurables (teléfonos, depósito, precio, fecha, premios) solo en `src/config.ts`.

## Stack
Vite + React + TypeScript, Tailwind v4, Motion, Lenis, lucide-react, xlsx, Supabase (Postgres + Realtime), funciones de Vercel en `api/` con JWT (jose), deploy en Vercel.

## Diseño
- Primarios: `#b8c11f` (lima), `#fc8616` (naranja). Secundarios: `#f9dd60`, `#e87136`, `#dfa063`, `#783d2b`, `#a8a237`. Fondo crema `#fff8e6`, texto `#783d2b`.
- **Sin pixel art.** Estilo ilustrado acogedor basado en `media/` (fondo de otoño pintado, logo Haven, erizo mascota, letrero en pasto, picnic, huerto, fotos de premios).
- Fuentes: **Darumadrop One** para títulos (`font-display`), **Jua** para texto (`font-body`).
- Animaciones: parallax con scroll y mouse, hojas cayendo, logo flotante, texto con degradado animado, cintas marquee, tarjetas con tilt, contador que voltea, botones con brillo y efecto magnético, chispas al hacer clic.
- `media/` contiene los originales; `public/media/` tiene las versiones .webp sin fondo blanco que usa el sitio.

## Secciones
Navbar → Hero (cuenta regresiva, CTA "Regístrate" a https://haven.hackclub.com/monterrey#top y "Reserva tu boleto") → Cintas → ¿Qué es Haven? → Premios → Boletos (grid 1–200 en tiempo real) → Cómo funciona + Puntos de venta → Verificar boleto → FAQ → Footer.

## Premios
- Drone Visuo XS809HW — https://www.mercadolibre.com.mx/drone-visuo-xs809hw-con-camara-hd-negro-1-bateria/p/MLM9394556
- DJI Osmo Mobile 8 — https://www.liverpool.com.mx/tienda/pdp/Estabilizador-compatible-con-smartphone-DJI-modelo-Osmo-Mobile-8/1187930398
- 3 tarjetas de regalo Amazon de $500 MXN
- Peluche Chiikawa (la foto es Chiikawa, el link original es de Usagi) — https://www.miniso.com.mx/peluche-chiikawa-usagi-felpa-amarillo-17x28-cm/p?idsku=41614

## Flujo de reserva
1. Usuario elige número (1–200) y llena nombre y procedencia (Preparatoria [cuál], Amigo de…, Conocido de…, Otro).
2. RPC atómica `reserve_ticket` en Supabase marca el boleto `reserved` con `reserved_at` y folio `code`; se bloquea para todos vía Realtime.
3. El usuario elige punto de venta y método de pago (efectivo o transferencia). Se abre WhatsApp al contacto de ese punto con número, folio, nombre, procedencia, hora de registro (America/Monterrey), monto, forma de pago y la leyenda de apoyo a Haven Mty.
4. Las reservas no expiran; el equipo retira las que no se pagan.
5. Sección "Verificar": por número o folio muestra estado (disponible / reservado / pagado) sin datos personales.
6. `/admin` con login JWT: marcar pagado, retirar números y exportar a Excel.

## Base de datos
`ticket_status(number, status)` es pública y tiene Realtime. `ticket_holders(number, code, name, origin, sale_point, payment_method, reserved_at, paid_at)` es privada. El público solo escribe con las RPC `reserve_ticket` y `check_ticket`; el admin usa la service role desde `/api`.

## Agentes
- Diseñador: revisa cada sección contra este documento (paleta, fuentes, uso de media, animaciones) y propone mejoras.
- QA: responsive, accesibilidad, reduced-motion, verificación de que no haya comentarios.
- Backend: flujo de reserva, RLS y concurrencia en Supabase.

## Datos
- Precio: $150 MXN. Evento: 14 y 15 de noviembre. Pago en efectivo o transferencia a 4213 1660 5091 2512 (Juan Daniel Hernandez Garza).
- Puntos de venta: PrepaTec Garza Laguera (Anna Antunez, +52 1 81 2443 0879), PrepaTec Cumbres (Edson, +52 1 81 2174 7721), EIAO (Jesus, +52 1 81 2892 6313), Ajeno (Edson).
- Las reservas no expiran: el equipo las retira desde `/admin`.
- `/admin` usa JWT propio (api/login.ts, api/tickets.ts) con credenciales en variables de entorno, nunca en el código. Exporta a Excel.

## Comandos
- `npm run dev` solo frontend; `npx vercel dev` para probar también `/api`.
- Ejecutar `supabase/migrations/001_tickets.sql` en el SQL editor de Supabase.
