import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import Particles from './components/ui/Particles'
import ToastContainer from './components/ui/Toast'
import './assets/scss/global.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="gradient-bg" />
      <Particles />
      <App />
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>,
)
