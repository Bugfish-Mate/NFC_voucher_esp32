import { useMemo, useState } from 'react'
import './App.css'

const API_BASE = ''

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = { ok: false, error: 'Ungültige Serverantwort' }
  }

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `HTTP ${response.status}`)
  }
  return payload
}

function App() {
  const [readResult, setReadResult] = useState(null)
  const [writeText, setWriteText] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: 'Bereit.' })
  const [busy, setBusy] = useState(false)

  const canWrite = useMemo(() => writeText.trim().length > 0 && !busy, [writeText, busy])

  const readTag = async () => {
    setBusy(true)
    setStatus({ type: 'info', message: 'Warte auf NFC-Tag...' })
    try {
      const data = await apiRequest('/api/tag/read', { method: 'POST' })
      setReadResult(data)
      setStatus({ type: 'success', message: 'Tag erfolgreich gelesen.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setBusy(false)
    }
  }

  const writeTag = async () => {
    setBusy(true)
    setStatus({ type: 'info', message: 'Warte auf NFC-Tag zum Schreiben...' })
    try {
      await apiRequest('/api/tag/write', {
        method: 'POST',
        body: JSON.stringify({ text: writeText }),
      })
      setStatus({ type: 'success', message: 'Text wurde auf Tag geschrieben.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="app">
      <section className="panel">
        <h1>NFC Webapp</h1>
        <p className="hint">REST API am ESP: <code>/api/tag/*</code></p>

        <div className="actions">
          <button onClick={readTag} disabled={busy}>
            {busy ? 'Bitte warten...' : 'NFC lesen'}
          </button>
        </div>

        {readResult && (
          <div className="result">
            <div><strong>Tagtyp:</strong> {readResult.tagType}</div>
            <div><strong>UID:</strong> {readResult.uid}</div>
            <div><strong>Text:</strong> {readResult.text || '(leer)'}</div>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>NFC beschreiben</h2>
        <label htmlFor="writeText">Text</label>
        <textarea
          id="writeText"
          value={writeText}
          onChange={(e) => setWriteText(e.target.value)}
          placeholder="Text für den NFC-Tag..."
          rows={5}
          disabled={busy}
        />
        <div className="actions">
          <button onClick={writeTag} disabled={!canWrite}>
            NFC beschreiben
          </button>
        </div>
      </section>

      <section className={`status ${status.type}`}>
        {status.message}
      </section>
    </main>
  )
}

export default App
