import React from 'react'
import '../styles/globals.css'
import AuthProvider from '../components/AuthProvider'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Timesheet App'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
