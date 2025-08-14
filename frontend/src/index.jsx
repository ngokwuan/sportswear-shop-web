import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import GlobalStyles from './components/GlobalStyles/global-style.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <GlobalStyles>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GlobalStyles>
);
