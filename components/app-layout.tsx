import type React from "react"
import type { ReactNode } from "react"

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return <div>{children}</div>
}

export { AppLayout }
