"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import Image from 'next/image';

export default function EditProfile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [lastEditedAt, setLastEditedAt] = useState('');
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    if (user) {
      setUsername(user.name);
      setEmail(user.email);
      setPreviewUrl(user.profilePicture || '');
      setLastEditedAt(user.lastEditedAt ? new Date(user.lastEditedAt).toLocaleString() : 'Never');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (profilePicture) formData.append('profilePicture', profilePicture);

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        body: formData,
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        setLastEditedAt(new Date(updatedUser.user.lastEditedAt).toLocaleString());
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id }),
        });
        if (response.ok) {
          localStorage.removeItem('user');
          setUser(null);
          router.push('/');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to delete account');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Edit Profile</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {lastEditedAt && (
        <p className="text-gray-600 mb-4 text-center">Last edited: {lastEditedAt}</p>
      )}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="mb-4 text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile"
                width={100}
                height={100}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-500">?</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-2 text-lg font-medium">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-lg font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-lg font-medium">New Password (leave blank to keep current)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
          Update Profile
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-200 mt-4"
        >
          Delete Account
        </button>
      </form>
    </div>
  );
}
