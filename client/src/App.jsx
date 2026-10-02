import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4000';

function App() {
  const [models, setModels] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [message, setMessage] = useState('Give me a quick summary of my current PC setup and best troubleshooting steps.');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [modelRes, systemRes] = await Promise.all([
          fetch(`${API_BASE}/api/models`),
          fetch(`${API_BASE}/api/system-info`),
        ]);

        const modelData = await modelRes.json();
        const systemData = await systemRes.json();

        setModels(modelData);
        setSystemInfo(systemData);

        const enabledModel = modelData.find((item) => item.enabled)?.id;
        if (enabledModel) {
          setSelectedModel(enabledModel);
        }
      } catch (err) {
        setError('Could not connect to the backend. Make sure the API server is running.');
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, model: selectedModel }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Request failed');
      }

      setResponse(data.response);
    } catch (err) {
      setError(err.message || 'Something went wrong while contacting the LLM.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>PC Assistant</h1>
        <p className="subtitle">Multi-model AI helper</p>

        <div className="panel">
          <h2>Model providers</h2>
          <ul>
            {models.map((model) => (
              <li key={model.id} className={model.enabled ? 'enabled' : 'disabled'}>
                <span>{model.label}</span>
                <strong>{model.enabled ? 'READY' : 'OFFLINE'}</strong>
              </li>
            ))}
          </ul>
        </div>

        {systemInfo && (
          <div className="panel">
            <h2>System info</h2>
            <div className="meta-grid">
              <div><span>Platform</span><strong>{systemInfo.platform}</strong></div>
              <div><span>CPU</span><strong>{systemInfo.cpuCount} cores</strong></div>
              <div><span>Memory</span><strong>{Math.round(systemInfo.totalMemory / (1024 * 1024 * 1024))} GB</strong></div>
              <div><span>Hostname</span><strong>{systemInfo.hostname}</strong></div>
            </div>
          </div>
        )}
      </aside>

      <main className="main-panel">
        <form onSubmit={handleSubmit} className="chat-form">
          <label htmlFor="model">Selected model</label>
          <select id="model" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
            {models.map((model) => (
              <option key={model.id} value={model.id} disabled={!model.enabled}>
                {model.label}
              </option>
            ))}
          </select>

          <label htmlFor="message">Ask your assistant</label>
          <textarea
            id="message"
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask for troubleshooting, file help, or system guidance..."
          />

          <button type="submit" disabled={loading || !selectedModel}>
            {loading ? 'Thinking...' : 'Send request'}
          </button>
        </form>

        {error && <div className="message error">{error}</div>}

        {response && (
          <section className="response-box">
            <h3>Assistant response</h3>
            <p>{response}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
