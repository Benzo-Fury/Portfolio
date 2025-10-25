import type React from "react"

export function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="font-sans antialiased">{children}</div>
}

export default Layout