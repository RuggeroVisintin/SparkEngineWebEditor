import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { App } from './App';
import { withStrictMode } from './hooks';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    withStrictMode(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    )
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);