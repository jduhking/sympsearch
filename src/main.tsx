import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.tsx'
import './index.css'
import '@/assets/fonts/LuckiestGuy-Regular.ttf'
import '@/assets/fonts/RedHatDisplay-VariableFont_wght.ttf'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
var windowTopBar = document.createElement('div');
windowTopBar.className = 'top-window';
document.body.appendChild(windowTopBar);


// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})


