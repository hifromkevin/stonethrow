import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

const Dashboard = () => (
  <Suspense fallback={<div className="min-h-screen bg-white" />}>
    <DashboardClient />
  </Suspense>
);

export default Dashboard;
