import { ReactQueryProvider } from '../providers/react-query'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><ReactQueryProvider>{children}</ReactQueryProvider></body>
    </html>
  )
}
