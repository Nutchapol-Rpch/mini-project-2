import { useUser } from '../app/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UserNav() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      {user ? (
        <>
          <button onClick={toggleDropdown} className="flex items-center focus:outline-none text-white">
            <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="mr-2">{user.name}</span>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link href="/edit-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Edit Profile
              </Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
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