import { getCurrentAdmin } from '@/lib/auth-simple';
import { redirect } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export async function AuthGuard({ children }: AuthGuardProps) {
  const admin = await getCurrentAdmin();
  
  if (!admin) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}