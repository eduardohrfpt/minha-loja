import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import V2App from './v2/V2App.jsx'
import VersionToggle from './v2/VersionToggle.jsx'

// Ponto único de bifurcação entre a versão atual (App, em "/") e a versão nova em teste
// (V2App, em "/v2/*"). Nenhum arquivo da versão atual é alterado por isso -- é só uma rota a
// mais apontando pra uma árvore de componentes totalmente separada.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <VersionToggle />
      <Routes>
        <Route path="/v2/*" element={<V2App />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
