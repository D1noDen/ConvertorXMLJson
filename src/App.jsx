import { useCallback, useMemo, useRef, useState } from 'react'
import './App.css'
import { xml2json } from 'xml-js'

function App() {
  const [xml, setXml] = useState('')
  const [json, setJson] = useState('')
  const [error, setError] = useState('')
  const [pretty, setPretty] = useState(true)
  const fileInputRef = useRef(null)

  const options = useMemo(() => ({
    compact: true, // simpler JSON
    spaces: pretty ? 2 : 0,
    ignoreComment: true,
    ignoreDeclaration: false,
    ignoreAttributes: false,
    alwaysChildren: false,
  }), [pretty])

  const onConvert = useCallback(() => {
    setError('')
    try {
      if (!xml.trim()) {
        setJson('')
        return
      }
      const result = xml2json(xml, options)
      setJson(result)
    } catch (e) {
      setJson('')
      setError(e?.message || 'Failed to convert XML')
    }
  }, [xml, options])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json)
    } catch {
      /* ignore */
    }
  }, [json])

  const onDownload = useCallback(() => {
    const blob = new Blob([json || ''], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [json])

  const onFileChange = useCallback(async (file) => {
    if (!file) return
    const text = await file.text()
    setXml(text)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (file) onFileChange(file)
  }, [onFileChange])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>XML → JSON Converter</h1>
        <p className="subtitle">Paste XML or drop a file on the left. Get JSON on the right.</p>
      </header>

      <div className="toolbar">
        <div className="left-actions">
          <button onClick={() => fileInputRef.current?.click()}>Upload XML</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,text/xml,application/xml"
            style={{ display: 'none' }}
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
          <button onClick={() => { setXml(''); setJson(''); setError('') }}>Clear</button>
        </div>
        <div className="right-actions">
          <label className="toggle">
            <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} />
            Pretty JSON
          </label>
          <button onClick={onConvert}>Convert</button>
          <button disabled={!json} onClick={onCopy}>Copy JSON</button>
          <button disabled={!json} onClick={onDownload}>Download JSON</button>
        </div>
      </div>

      <main className="panes">
        <section className="pane left" onDrop={onDrop} onDragOver={onDragOver}>
          <div className="pane-header">XML Input</div>
          <textarea
            className="code-input"
            placeholder="Paste XML here or drag & drop an .xml file..."
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            spellCheck={false}
          />
          {error && <div className="error">{error}</div>}
        </section>

        <section className="pane right">
          <div className="pane-header">JSON Output</div>
          <pre className="code-output">{json}</pre>
        </section>
      </main>

      <footer className="app-footer">
        <small>Client-side only. No data is uploaded.</small>
      </footer>
    </div>
  )
}

export default App
