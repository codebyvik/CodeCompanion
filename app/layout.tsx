import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'



import './globals.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'primary-gradient',
          footerActionLink: 'primary-text-gradient hover:text-primary-500'
        }
      }}
    >
      <html lang="en">
        <body >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}