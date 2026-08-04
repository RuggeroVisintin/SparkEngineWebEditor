import { Routes, Route } from 'react-router';
import { Editor } from './pages/Editor';
import { Preview, Scripting } from './pages';
import { EditorServiceProvider } from './providers';

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<EditorServiceProvider><Editor /></EditorServiceProvider>} />
            <Route path="/preview/:sceneId" element={<Preview />} />
            <Route path="/scripting/:entityUuid/:componentUuid/:callbackPropertyName" element={<Scripting />} />
            {/* Add more routes as needed */}
        </Routes>
    );
}