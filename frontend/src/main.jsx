import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'

// ─── Global Error Boundary — catches render crashes and shows a message ────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f0f4ff', fontFamily: 'system-ui, sans-serif', padding: 24,
        }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ color: '#1e3a5f', marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#64748b', marginBottom: 24 }}>
              SportBridge encountered an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              style={{
                background: '#2F7DF0', color: '#fff', border: 'none',
                borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 15,
              }}
            >
              Refresh page
            </button>
            {this.state.error && (
              <details style={{ marginTop: 24, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#dc3545', fontSize: 13 }}>
                  Error details
                </summary>
                <pre style={{
                  background: '#1e293b', color: '#f1f5f9', padding: 12,
                  borderRadius: 6, fontSize: 11, overflow: 'auto', marginTop: 8,
                }}>
                  {this.state.error?.message}
                  {'\n'}
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
