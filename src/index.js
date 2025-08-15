import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // ✅ เพิ่มบรรทัดนี้
import "./assets/fonts.css";   // ✅ โหลด font-face

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>        {/* ✅ ห่อ App ด้วย Router */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
