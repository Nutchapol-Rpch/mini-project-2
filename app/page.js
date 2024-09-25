"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import "./globals.css";

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

async function getPublicFlashcardSets() {
  const url = `./api/flashcard-sets?isPublic=true`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch public flashcard sets');
  }
  return res.json();
}

export default function Home() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [publicFlashcardSets, setPublicFlashcardSets] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        try {
          const userData = await getFlashcardSets(parsedUser._id);
          setFlashcardSets(userData);
        } catch (error) {
          console.error(error);
        }
      }
      try {
        const publicData = await getPublicFlashcardSets();
        setPublicFlashcardSets(publicData);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredFlashcardSets = flashcardSets.filter((set) =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicFlashcardSets = publicFlashcardSets.filter((set) =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <header className="mb-8 p-6 bg-white rounded-lg shadow flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-700">Welcome to Budzdy</h1>
            <p className="text-lg text-gray-500">Create, study, and master your flashcards</p>
          </div>
          {user && (
            <div className="text-xl text-gray-700 font-medium">
              Hello, {user.name}
            </div>
          )}
        </header>

        {/* Flashcard Sets Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Flashcard Sets</h2>
          <Link
            href="/create-set"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            <FaPlus className="mr-2" />
            Create New Set
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your sets"
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">Loading flashcard sets...</p>
          </div>
        ) : (
          <>
            {/* Your Flashcard Sets */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Flashcard Sets</h2>
              {filteredFlashcardSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFlashcardSets.map((set) => (
                    <Link key={set._id} href={`/flashcard-set/${set._id}`}>
                      <div className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                        <h3 className="text-xl font-semibold mb-1 text-blue-600">{set.title}</h3>
                        <p className="text-gray-500 mb-2">Created by: {set.createdBy.username}</p>
                        <p className="text-gray-600 mb-3">{set.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>{set.cards.length} cards</span>
                          <span>Last updated: {new Date(set.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-md shadow-sm">
                  <p className="text-lg text-gray-700">No flashcard sets found. Create your first set!</p>
                </div>
              )}
            </section>

            {/* Public Flashcard Sets */}
            <section className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Public Flashcard Sets</h2>
              {filteredPublicFlashcardSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicFlashcardSets.map((set) => (
                    <Link key={set._id} href={`/flashcard-set/${set._id}`}>
                      <div className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                        <h3 className="text-xl font-semibold mb-1 text-blue-600">{set.title}</h3>
                        <p className="text-gray-500 mb-2">Created by: {set.createdBy.username}</p>
                        <p className="text-gray-600 mb-3">{set.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>{set.cards.length} cards</span>
                          <span>Last updated: {new Date(set.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-md shadow-sm">
                  <p className="text-lg text-gray-700">No public flashcard sets found.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>

  );
}
