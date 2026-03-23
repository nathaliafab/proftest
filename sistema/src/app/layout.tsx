import './globals.css';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'Proftest',
  description: 'A platform to help professors create and correct tests.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  )
}
