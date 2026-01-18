import { ReactElement, useEffect, useState } from "react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";

export const WithMemoryRouter = (
    component: ReactElement,
    onNavigate?: ({ history, location }: { history: any; location: any }) => null
) => {

    const Wrapper = () => {
        const location = useLocation();
        const [history, setHistory] = useState<any>([]);

        useEffect(() => {
            const newHistory = [...history, location.pathname]
            setHistory(newHistory);

            if (onNavigate) {
                onNavigate({ history: newHistory, location });
            }
        }, [location]);

        return component;
    };

    return (
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="*" element={<Wrapper />} />
            </Routes>
        </MemoryRouter>
    );
};