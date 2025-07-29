// app/main/layout.tsx
import Nav from '@/components/nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Nav/>
      {children}
    </main>
  );
}
