import { getPebbles } from '@/lib/queries/getPebbles';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const pebbles = await getPebbles();

  return <DashboardClient savedPebbles={pebbles} />;
}
