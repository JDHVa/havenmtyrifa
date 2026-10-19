import { useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { SALE_POINTS, TICKETS } from '../config'
import { formatMty } from '../lib/whatsapp'

type Row = {
  number: number
  code: string
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

export function Admin() {
  const [token, setToken] = useState(readToken)
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [pointFilter, setPointFilter] = useState('')
  const [confirmRelease, setConfirmRelease] = useState<number | null>(null)

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
  }, [token, logout])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const act = async (number: number, action: 'paid' | 'unpaid' | 'release') => {
    setError('')
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ number, action }),
    })
    if (res.status === 401) return logout()
    if (!res.ok) return setError((await res.json()).error ?? 'Error')
    setConfirmRelease(null)
    load()
  }

  const visible = useMemo(() => {
    const f = filter.toLowerCase()
    return rows.filter(
      (r) =>
        (!pointFilter || r.sale_point === pointFilter) &&
        (!f || `${r.number} ${r.code} ${r.name} ${r.origin}`.toLowerCase().includes(f)),
    )
  }, [rows, filter, pointFilter])

  const exportExcel = () => {
    const data = rows.map((r) => ({
      Boleto: r.number,
      Folio: r.code,
      Nombre: r.name,
      Procedencia: r.origin,
      'Punto de venta': pointLabel(r.sale_point),
      'Método de pago': r.payment_method,
      Estado: r.status === 'paid' ? 'Pagado' : 'Reservado',
      'Fecha de registro': formatMty(r.reserved_at),
      'Fecha de pago': r.paid_at ? formatMty(r.paid_at) : '',
      Monto: TICKETS.price,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [6, 16, 28, 28, 22, 14, 10, 26, 26, 8].map((wch) => ({ wch }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Boletos')
    XLSX.writeFile(wb, `haven-mty-boletos-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  if (!token) return <Login onToken={setToken} />

  const paid = rows.filter((r) => r.status === 'paid').length

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-bark">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-4xl">Panel Haven MTY</h1>
          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={load} className="btn bg-sun !py-2">Actualizar</button>
            <button type="button" onClick={exportExcel} className="btn bg-lime !py-2">Exportar Excel</button>
            <button type="button" onClick={logout} className="btn bg-sand !py-2">Salir</button>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Apartados', rows.length],
            ['Pagados', paid],
            ['Pendientes', rows.length - paid],
            ['Recaudado', `$${paid * TICKETS.price}`],
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

        {error && <p className="mt-4 border-4 border-rust bg-white p-2 text-rust">{error}</p>}

        <div className="mt-6 overflow-x-auto border-4 border-bark bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-bark font-body text-sun">
              <tr>
                {['#', 'Folio', 'Nombre', 'Procedencia', 'Punto', 'Pago', 'Registro', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.number} className="border-t-2 border-sand/60">
                  <td className="px-3 py-2 font-body">{r.number}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.origin}</td>
                  <td className="px-3 py-2">{pointLabel(r.sale_point)}</td>
                  <td className="px-3 py-2 capitalize">{r.payment_method}</td>
                  <td className="px-3 py-2 text-xs">{formatMty(r.reserved_at)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 font-body text-xs ${r.status === 'paid' ? 'bg-lime' : 'bg-sun'}`}>
                      {r.status === 'paid' ? 'Pagado' : 'Reservado'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => act(r.number, r.status === 'paid' ? 'unpaid' : 'paid')}
                        className="border-2 border-bark bg-lime px-2 py-1 text-xs hover:brightness-95"
                      >
                        {r.status === 'paid' ? 'Desmarcar' : 'Pagado'}
                      </button>
                      {confirmRelease === r.number ? (
                        <button type="button" onClick={() => act(r.number, 'release')} className="border-2 border-bark bg-rust px-2 py-1 text-xs text-white">
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
                  <td colSpan={9} className="px-3 py-8 text-center font-body">Sin boletos apartados.</td>
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
    if (!res || !res.ok) return setError('Usuario o contraseña incorrectos.')
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
          <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" className="border-4 border-bark bg-cream px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 font-body">
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="border-4 border-bark bg-cream px-3 py-2" />
        </label>
        {error && <p className="font-body text-sm text-rust">{error}</p>}
        <button type="submit" disabled={busy} className="btn bg-orange text-cream">{busy ? '...' : 'Entrar'}</button>
      </form>
    </main>
  )
}
