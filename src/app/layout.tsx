import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'MemeX – Duelverse',
  description: 'The ultimate Web3 meme trading card game',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a1a] text-white font-sans min-h-screen relative overflow-x-hidden">

        {/* Freigestellter NAVI-Block */}
        <div className="relative z-50 flex justify-center pt-12 pb-10">
          <header className="w-full max-w-[1600px] rounded-3xl border border-memex-accent bg-[#11111f]/80 shadow-[0_0_80px_rgba(125,249,255,0.4)] backdrop-blur-2xl px-16 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <img src="/logo.svg" alt="MemeX Logo" className="h-16 w-auto" />
              <h1 className="text-4xl font-black tracking-widest text-memex-primary">MemeX</h1>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-10 text-xl font-bold tracking-wide text-memex-primary">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="/presale" className="hover:text-white transition">Presale</a>
              <a href="/account" className="hover:text-white transition">Account</a>
              <a href="/social-media" className="hover:text-white transition">Socials</a>
              <a href="/whitepaper" className="hover:text-white transition">Whitepaper</a>
            </nav>
          </header>
        </div>

        {/* Hintergrundbild */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[url('/bg-placeholder.jpg')] bg-cover bg-center opacity-[0.04]" />

        {/* Hauptinhalt */}
        <main className="pt-4 pb-32 px-4">
          <div className="max-w-[1440px] mx-auto space-y-24">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-memex-accent opacity-50">
          © 2025 MemeX Duelverse. All rights reserved.
        </footer>
      </body>
    </html>
  )
}