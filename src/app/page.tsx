import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root route to the Help page so initial page is Help
  redirect('/help');
}


