"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-gray-800">Edit Profile</h1>
      {error && <p className="text-red-500 text-center mb-6">{error}</p>}
      {lastEditedAt && (
        <p className="text-gray-500 text-sm text-center mb-6">Last edited: {lastEditedAt}</p>
      )}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-xl rounded-lg p-8">
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
          <div className="flex justify-center items-center mt-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block max-w-xs text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="username" className="block mb-3 text-lg font-semibold text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block mb-3 text-lg font-semibold text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-3 text-lg font-semibold text-gray-700">New Password <span className="text-sm text-gray-500">(leave blank to keep current)</span></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md">
          Update Profile
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-md mt-5"
        >
          Delete Account
        </button>
      </form>
    </div>
  );

}
