import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AIPMA - Alianza Internacional de Periodismo y Medios Audiovisuales',
  description: 'Conectando el periodismo y los medios en el mundo. Asociación internacional de periodistas y profesionales de medios audiovisuales.',
  keywords: 'periodismo, medios audiovisuales, alianza internacional, ética periodística, credibilidad',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}