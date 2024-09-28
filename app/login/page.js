"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user); // Update user context

        // Fetch full user data including profile picture
        const userResponse = await fetch(`/api/users?userId=${data.user._id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user); // Update user context with full user data
          localStorage.setItem('user', JSON.stringify(userData.user));
        }

        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded-lg"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded-lg"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don&apos;t have an account? <Link href="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
