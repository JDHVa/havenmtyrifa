import { useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { SALE_POINTS, TICKETS } from '../config'
import { formatMty } from '../lib/whatsapp'
import { orderTotal, ticketShare } from '../lib/pricing'

type Row = {
  number: number
  code: string
  group_code: string | null
  name: string
  origin: string
  sale_point: string
  payment_method: string
  reserved_at: string
  paid_at: string | null
  status: 'reserved' | 'paid'
}

const KEY = 'haven-admin-token'

const readToken = () => {
  try {
    return sessionStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

const pointLabel = (id: string) => SALE_POINTS.find((p) => p.id === id)?.label ?? id

const money = (n: number) => `$${n.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const mtyParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Monterrey',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const excelDate = (iso: string | null) => {
  if (!iso) return null
  const p = Object.fromEntries(mtyParts.formatToParts(new Date(iso)).map((x) => [x.type, Number(x.value)]))
  return Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) / 86400000 + 25569
}

const DATE_FMT = 'dd/mm/yyyy hh:mm'
const MONEY_FMT = '"$"#,##0.00'

type Cell = string | number | null

function makeSheet(header: string[], body: Cell[][], widths: number[], formats: Record<number, string>) {
  const ws = XLSX.utils.aoa_to_sheet([header, ...body])
  for (let r = 1; r <= body.length; r++) {
    for (const [c, z] of Object.entries(formats)) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: Number(c) })]
      if (cell && cell.t === 'n') cell.z = z
    }
  }
  ws['!cols'] = widths.map((wch) => ({ wch }))
  if (body.length) ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: body.length, c: header.length - 1 } }) }
  return ws
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

async function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true }) as ArrayBuffer
  const blob = new Blob([data], { type: XLSX_MIME })
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  if (touch && typeof File !== 'undefined' && navigator.canShare) {
    const file = new File([blob], filename, { type: XLSX_MIME })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    a.remove()
    URL.revokeObjectURL(url)
  }, 60000)
}

export function Admin() {
  const [token, setToken] = useState(readToken)
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [pointFilter, setPointFilter] = useState('')
  const [confirmRelease, setConfirmRelease] = useState<number | null>(null)
  const [checked, setChecked] = useState<number[]>([])
  const [busy, setBusy] = useState(false)

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      setError('')
    }
    setToken('')
  }, [])

  const load = useCallback(async () => {
    const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
    if (res.status === 401) return logout()
    const json = await res.json()
    if (!res.ok) return setError(json.error ?? 'Error')
    setRows(json.rows)
    setChecked((c) => c.filter((n) => (json.rows as Row[]).some((r) => r.number === n)))
  }, [token, logout])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const act = async (body: { number?: number; numbers?: number[]; action: 'paid' | 'unpaid' | 'release' | 'group' | 'ungroup' }) => {
    setError('')
    setBusy(true)
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    setBusy(false)
    if (res.status === 401) return logout()
    if (!res.ok) return setError((await res.json()).error ?? 'Error')
    setConfirmRelease(null)
    if (body.action === 'group') setChecked([])
    load()
  }

  const groupSize = useMemo(() => {
    const m: Record<string, number> = {}
    for (const r of rows) if (r.group_code) m[r.group_code] = (m[r.group_code] ?? 0) + 1
    return m
  }, [rows])

  const share = useCallback((r: Row) => ticketShare(r.group_code ? groupSize[r.group_code] ?? 1 : 1), [groupSize])

  const orders = useMemo(() => {
    const m = new Map<string, Row[]>()
    for (const r of rows) {
      const key = r.group_code ?? r.code
      m.set(key, [...(m.get(key) ?? []), r])
    }
    return [...m.entries()].map(([key, list]) => ({ key, list, total: orderTotal(list.length) }))
  }, [rows])

  const toggleCheck = (n: number) =>
    setChecked((c) => (c.includes(n) ? c.filter((x) => x !== n) : c.length >= 2 ? [c[1], n] : [...c, n]))

  const visible = useMemo(() => {
    const f = filter.toLowerCase()
    return rows.filter(
      (r) =>
        (!pointFilter || r.sale_point === pointFilter) &&
        (!f || `${r.number} ${r.code} ${r.name} ${r.origin}`.toLowerCase().includes(f)),
    )
  }, [rows, filter, pointFilter])

  const exportExcel = () => {
    const estado = (s: Row['status']) => (s === 'paid' ? 'Pagado' : 'Reservado')
    const metodo = (m: string) => (m === 'efectivo' ? 'Efectivo' : m === 'transferencia' ? 'Transferencia' : m)

    const tickets = makeSheet(
      ['Boleto', 'Folio', 'Paquete', 'Nombre', 'Procedencia', 'Punto de venta', 'Método de pago', 'Estado', 'Fecha de registro', 'Fecha de pago', 'Monto'],
      rows.map((r) => [
        r.number,
        r.code,
        r.group_code ? `${r.group_code} (${TICKETS.promo.qty}x$${TICKETS.promo.price})` : 'Individual',
        r.name,
        r.origin,
        pointLabel(r.sale_point),
        metodo(r.payment_method),
        estado(r.status),
        excelDate(r.reserved_at),
        excelDate(r.paid_at),
        share(r),
      ]),
      [8, 16, 20, 28, 28, 22, 15, 11, 18, 18, 11],
      { 8: DATE_FMT, 9: DATE_FMT, 10: MONEY_FMT },
    )

    const byOrder = makeSheet(
      ['Pedido', 'Boletos', 'Cantidad', 'Nombre', 'Procedencia', 'Punto de venta', 'Método de pago', 'Estado', 'Fecha de registro', 'Total'],
      orders.map(({ key, list, total }) => {
        const r = list[0]
        const allPaid = list.every((x) => x.status === 'paid')
        const somePaid = list.some((x) => x.status === 'paid')
        return [
          key,
          list.map((x) => x.number).join(', '),
          list.length,
          r.name,
          r.origin,
          pointLabel(r.sale_point),
          metodo(r.payment_method),
          allPaid ? 'Pagado' : somePaid ? 'Pago parcial' : 'Reservado',
          excelDate(r.reserved_at),
          total,
        ]
      }),
      [16, 12, 9, 28, 28, 22, 15, 13, 18, 11],
      { 8: DATE_FMT, 9: MONEY_FMT },
    )

    const sum = (list: Row[]) => list.reduce((a, r) => a + share(r), 0)
    const summaryRows: Cell[][] = [
      ['Total', rows.length, rows.filter((r) => r.status === 'paid').length, sum(rows.filter((r) => r.status === 'paid')), sum(rows.filter((r) => r.status !== 'paid')), sum(rows)],
      ...SALE_POINTS.map((p) => {
        const list = rows.filter((r) => r.sale_point === p.id)
        const paidList = list.filter((r) => r.status === 'paid')
        return [p.label, list.length, paidList.length, sum(paidList), sum(list) - sum(paidList), sum(list)] as Cell[]
      }),
    ]
    const summary = makeSheet(
      ['Punto de venta', 'Boletos apartados', 'Boletos pagados', 'Recaudado', 'Por cobrar', 'Total esperado'],
      summaryRows,
      [24, 18, 16, 14, 14, 16],
      { 3: MONEY_FMT, 4: MONEY_FMT, 5: MONEY_FMT },
    )
    delete summary['!autofilter']

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, summary, 'Resumen')
    XLSX.utils.book_append_sheet(wb, byOrder, 'Pedidos')
    XLSX.utils.book_append_sheet(wb, tickets, 'Boletos')
    return saveWorkbook(wb, `haven-mty-boletos-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (!token) return <Login onToken={setToken} />

  const paidRows = rows.filter((r) => r.status === 'paid')
  const collected = paidRows.reduce((a, r) => a + share(r), 0)
  const pending = rows.reduce((a, r) => a + share(r), 0) - collected
  const checkedRows = rows.filter((r) => checked.includes(r.number))

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-bark">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-4xl">Panel Haven MTY</h1>
          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={load} className="btn bg-sun !py-2">Actualizar</button>
            <button
              type="button"
              onClick={async () => {
                setError('')
                if (!rows.length) return setError('No hay boletos apartados para exportar. Dale a Actualizar primero.')
                try {
                  await exportExcel()
                } catch (e) {
                  setError(`No se pudo exportar el Excel: ${(e as Error).message}`)
                }
              }}
              className="btn bg-lime !py-2"
            >
              Exportar Excel
            </button>
            <button type="button" onClick={logout} className="btn bg-sand !py-2">Salir</button>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            ['Apartados', rows.length],
            ['Pagados', paidRows.length],
            ['Pendientes', rows.length - paidRows.length],
            ['Recaudado', money(collected)],
            ['Por cobrar', money(pending)],
          ].map(([l, v]) => (
            <div key={l} className="card bg-sun p-3 text-center">
              <div className="font-display text-3xl">{v}</div>
              <div className="font-body text-sm">{l}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar número, folio, nombre…"
            className="flex-1 border-4 border-bark bg-white px-3 py-2"
          />
          <select value={pointFilter} onChange={(e) => setPointFilter(e.target.value)} className="border-4 border-bark bg-white px-3 py-2">
            <option value="">Todos los puntos</option>
            {SALE_POINTS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-4 border-bark bg-sun p-3 font-body text-sm">
          <span>
            {checked.length
              ? `Seleccionados: ${checkedRows.map((r) => `#${r.number}`).join(' y ')}`
              : `Marca 2 boletos de la misma persona para juntarlos en un paquete ${TICKETS.promo.qty}x$${TICKETS.promo.price}.`}
          </span>
          {checked.length > 0 && (
            <>
              <button
                type="button"
                disabled={checked.length !== 2 || busy}
                onClick={() => act({ numbers: checked, action: 'group' })}
                className="border-2 border-bark bg-orange px-3 py-1 text-cream disabled:opacity-50"
              >
                Juntar como paquete {TICKETS.promo.qty}x${TICKETS.promo.price}
              </button>
              <button type="button" onClick={() => setChecked([])} className="border-2 border-bark bg-cream px-3 py-1">
                Limpiar
              </button>
            </>
          )}
        </div>

        {error && <p className="mt-4 border-4 border-rust bg-white p-2 text-rust">{error}</p>}

        <div className="mt-6 overflow-x-auto border-4 border-bark bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-bark font-body text-sun">
              <tr>
                {['', '#', 'Folio', 'Paquete', 'Nombre', 'Procedencia', 'Punto', 'Pago', 'Registro', 'Monto', 'Estado', 'Acciones'].map((h, i) => (
                  <th key={i} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.number} className={`border-t-2 border-sand/60 ${checked.includes(r.number) ? 'bg-sun/40' : ''}`}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked.includes(r.number)}
                      onChange={() => toggleCheck(r.number)}
                      aria-label={`Seleccionar boleto ${r.number}`}
                      className="size-4 accent-orange"
                    />
                  </td>
                  <td className="px-3 py-2 font-body">{r.number}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2">
                    {r.group_code ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-orange px-2 py-0.5 font-mono text-xs text-cream">{r.group_code}</span>
                        <span className="text-xs">
                          con #{rows.filter((x) => x.group_code === r.group_code && x.number !== r.number).map((x) => x.number).join(', #')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-bark/60">Individual</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.origin}</td>
                  <td className="px-3 py-2">{pointLabel(r.sale_point)}</td>
                  <td className="px-3 py-2 capitalize">{r.payment_method}</td>
                  <td className="px-3 py-2 text-xs">{formatMty(r.reserved_at)}</td>
                  <td className="px-3 py-2 font-body">{money(share(r))}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 font-body text-xs ${r.status === 'paid' ? 'bg-lime' : 'bg-sun'}`}>
                      {r.status === 'paid' ? 'Pagado' : 'Reservado'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act({ number: r.number, action: r.status === 'paid' ? 'unpaid' : 'paid' })}
                        className="border-2 border-bark bg-lime px-2 py-1 text-xs hover:brightness-95 disabled:opacity-50"
                      >
                        {r.status === 'paid' ? 'Desmarcar' : r.group_code ? 'Pagado (paquete)' : 'Pagado'}
                      </button>
                      {r.group_code && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => act({ number: r.number, action: 'ungroup' })}
                          className="border-2 border-bark bg-cream px-2 py-1 text-xs disabled:opacity-50"
                        >
                          Separar
                        </button>
                      )}
                      {confirmRelease === r.number ? (
                        <button type="button" disabled={busy} onClick={() => act({ number: r.number, action: 'release' })} className="border-2 border-bark bg-rust px-2 py-1 text-xs text-white">
                          ¿Seguro?
                        </button>
                      ) : (
                        <button type="button" onClick={() => setConfirmRelease(r.number)} className="border-2 border-bark bg-sand px-2 py-1 text-xs">
                          Retirar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center font-body">Sin boletos apartados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password }),
    }).catch(() => null)
    setBusy(false)
    if (!res) return setError('No se pudo conectar con el servidor.')
    if (res.status === 404) return setError('La API no está disponible aquí. Usa el sitio de Vercel o npx vercel dev.')
    if (!res.ok) return setError('Usuario o contraseña incorrectos.')
    const { token } = await res.json()
    try {
      sessionStorage.setItem(KEY, token)
    } catch {
      setError('')
    }
    onToken(token)
  }

  return (
    <main className="dots flex min-h-screen items-center justify-center bg-cream px-4 text-bark">
      <form onSubmit={submit} className="card flex w-full max-w-sm flex-col gap-4 bg-sun p-6">
        <h1 className="font-display text-4xl">Panel de orgs</h1>
        <label className="flex flex-col gap-1 font-body">
          Usuario
          <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="border-4 border-bark bg-cream px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 font-body">
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" className="border-4 border-bark bg-cream px-3 py-2" />
        </label>
        {error && <p className="font-body text-sm text-rust">{error}</p>}
        <button type="submit" disabled={busy} className="btn bg-orange text-cream">{busy ? '...' : 'Entrar'}</button>
      </form>
    </main>
  )
}
