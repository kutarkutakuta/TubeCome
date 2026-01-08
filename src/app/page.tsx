import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root route to the Channels page so initial page is Channels
  redirect('/channels');
}


