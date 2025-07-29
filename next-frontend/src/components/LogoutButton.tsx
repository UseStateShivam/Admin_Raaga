'use client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    Cookies.remove('token'); // Clear client cookie
    await fetch('/logout', { method: 'POST' }); // Clear server cookie
    router.replace('/login'); // redirect back to login
  };

  return <button onClick={logout}>Logout</button>;
}
