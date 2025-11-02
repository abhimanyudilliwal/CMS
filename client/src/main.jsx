import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import '@mysten/dapp-kit/dist/index.css'
import App from './App.jsx'
import { SuiWalletContextProvider } from './context/SuiWalletContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SuiWalletContextProvider>
      <App />
    </SuiWalletContextProvider>
  </React.StrictMode>,
)
