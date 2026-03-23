"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, FileText, Printer, BarChart2 } from 'lucide-react';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoLink}>
            <h1 className={styles.logoTitle}>Proftest</h1>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link 
            href="/questions" 
            className={`${styles.navItem} ${pathname === '/questions' ? styles.navItemActive : ''}`}
          >
            <ListTodo size={20} />
            Questões
          </Link>
          <Link 
            href="/tests" 
            className={`${styles.navItem} ${pathname === '/tests' ? styles.navItemActive : ''}`}
          >
            <FileText size={20} />
            Provas
          </Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {children}
        
        <footer className={styles.pageFooter}>
          <span>© 2026 Proftest</span>
        </footer>
      </main>
    </div>
  );
}
