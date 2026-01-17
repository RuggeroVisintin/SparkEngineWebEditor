import { ReactNode } from "react"
import { StrictMode } from "react"

export const withStrictMode = (component: ReactNode) => {
    return <StrictMode>
        {component}
    </StrictMode>
}