import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 重置浏览器默认 margin/padding，让背景色铺满全屏
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.background = '#0f0f1a'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
