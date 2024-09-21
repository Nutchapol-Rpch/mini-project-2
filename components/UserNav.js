import { useUser } from '../app/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <div>
      {user ? (
        <>
          <span className="mr-4">Hello, {user.name}</span>
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        </>
      ) : (
        <>
          <Link href="/login" className="mr-4 hover:underline">Login</Link>
          <Link href="/register" className="hover:underline">Sign up</Link>
        </>
      )}
    </div>
  );
}
