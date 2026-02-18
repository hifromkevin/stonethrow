import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // This page is protected by middleware, so user is authenticated
  // Redirect to dashboard
  redirect('/dashboard');
}
