import { GlobalLayout } from '@/components/GlobalLayout';
import { MainContent } from '@/components/MainContent';

export default async function HomePage() {
  return (
    <GlobalLayout>
      <MainContent showHeader={false} />
    </GlobalLayout>
  );
}