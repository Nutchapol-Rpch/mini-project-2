"use client";

import Link from 'next/link';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useEffect, useState } from 'react';

async function getFlashcardSets(userId) {
  const url = userId 
    ? `./api/flashcard-sets?userId=${userId}` 
    : `./api/flashcard-sets`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch flashcard sets');
  }
  return res.json();
}

export default function Home() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        try {
          const userResponse = await fetch(`/api/users?userId=${parsedUser._id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.user);
            localStorage.setItem('user', JSON.stringify(userData.user));
          }
          const data = await getFlashcardSets(parsedUser._id);
          setFlashcardSets(data);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          const data = await getFlashcardSets();
          setFlashcardSets(data);
        } catch (error) {
          console.error(error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredFlashcardSets = flashcardSets.filter((set) =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Budzdy</h1>
          <p className="text-xl text-gray-600">Create, study, and master your flashcards</p>
        </div>
        {user && <div className="text-xl">Hello, {user.name}</div>}
      </header>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Flashcard Sets</h2>
        <Link href="/create-set" className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          <FaPlus className="mr-2" />
          Create New Set
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search your sets"
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-xl">Loading flashcard sets...</p>
        </div>
      ) : filteredFlashcardSets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcardSets.map((set) => (
            <Link key={set._id} href={`/flashcard-set/${set._id}`}>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <h3 className="text-xl font-semibold mb-2">{set.title}</h3>
                <p className="text-gray-600 mb-4">{set.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{set.cards.length} cards</span>
                  <span>Last updated: {new Date(set.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl">No flashcard sets found. Create your first set!</p>
        </div>
      )}
    </div>
  );
}
