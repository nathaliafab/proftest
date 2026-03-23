export const metadata = {
  title: 'Proftest',
  description: 'Next.js App inside Docker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
