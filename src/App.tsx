import { Routes, Route } from 'react-router';
import { Editor } from './pages/Editor';
import { Preview, Scripting } from './pages';

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="/preview/:sceneUuid" element={<Preview />} />
            <Route path="/scripting/:entityUuid/:componentUuid/:callbackPropertyName" element={<Scripting />} />
            {/* Add more routes as needed */}
        </Routes>
    );
}