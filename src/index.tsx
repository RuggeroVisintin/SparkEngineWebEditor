import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { App } from './App';
import { withStrictMode } from './hooks';
import { toRouterBasename } from './config/routerBase';

const root = ReactDOM.createRoot(document.getElementById('root')!);
const routerBasename = toRouterBasename(import.meta.env.BASE_URL ?? '/');
root.render(
    withStrictMode(
        <BrowserRouter basename={routerBasename}>
            <App />
        </BrowserRouter>
    )
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);