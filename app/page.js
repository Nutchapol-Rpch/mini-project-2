"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaShare } from 'react-icons/fa';
import "./globals.css";

async function getFlashcardSets(userId) {
  const setsUrl = userId
    ? `./api/flashcard-sets?userId=${userId}`
    : `./api/flashcard-sets`;
  const setsRes = await fetch(setsUrl, { cache: 'no-store' });
  if (!setsRes.ok) {
    throw new Error('Failed to fetch flashcard sets');
  }
  const sets = await setsRes.json();

  // Fetch card counts for these sets
  const setIds = sets.map(set => set._id).join(',');
  const cardCountsUrl = `./api/card?flashcardSetIds=${setIds}`;
  const cardCountsRes = await fetch(cardCountsUrl, { cache: 'no-store' });
  if (!cardCountsRes.ok) {
    throw new Error('Failed to fetch card counts');
  }
  const cardCounts = await cardCountsRes.json();

  // Create a map of flashcardSetId to cardCount and cards
  const cardMap = cardCounts.reduce((map, item) => {
    map[item.flashcardSetId] = {
      cardCount: item.cardCount,
      cards: item.cards
    };
    return map;
  }, {});

  // Merge card counts and cards with flashcard sets
  return sets.map(set => ({
    ...set,
    cardCount: cardMap[set._id]?.cardCount || 0,
    cards: cardMap[set._id]?.cards || []
  }));
}


async function getPublicFlashcardSets() {
  const setsUrl = `./api/flashcard-sets?isPublic=true`;
  const setsRes = await fetch(setsUrl, { cache: 'no-store' });
  if (!setsRes.ok) {
    throw new Error('Failed to fetch public flashcard sets');
  }
  const sets = await setsRes.json();

  // Fetch card counts for these sets
  const setIds = sets.map(set => set._id).join(',');
  const cardCountsUrl = `./api/card?flashcardSetIds=${setIds}`;
  const cardCountsRes = await fetch(cardCountsUrl, { cache: 'no-store' });
  if (!cardCountsRes.ok) {
    throw new Error('Failed to fetch card counts for public sets');
  }
  const cardCounts = await cardCountsRes.json();

  // Create a map of flashcardSetId to cardCount and cards
  const cardMap = cardCounts.reduce((map, item) => {
    map[item.flashcardSetId] = {
      cardCount: item.cardCount,
      cards: item.cards
    };
    return map;
  }, {});

  // Merge card counts and cards with flashcard sets
  return sets.map(set => ({
    ...set,
    cardCount: cardMap[set._id]?.cardCount || 0,
    cards: cardMap[set._id]?.cards || []
  }));
}

const handleShare = (id) => {
  const url = `${window.location.origin}/flashcard-set/${id}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link copied to clipboard!');
  });
};

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

      // Clear the update flag
      localStorage.removeItem('flashcardSetUpdated');
    };

    fetchData();

    // Add an event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'flashcardSetUpdated' && e.newValue === 'true') {
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
      <div className="container mx-auto px-6 py-8 mb-auto">
        {/* Header Section */}
        <header className="container mx-auto px-6 py-8 bg-white shadow-md rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-extrabold text-blue-800 mb-3">Welcome to Budzdy</h1>
              <p className="text-lg text-gray-600">Create, study, and master your flashcards</p>
            </div>
            {user && (
              <div className="text-xl font-medium text-gray-700">
                Hello, {user.name}
              </div>
            )}
          </div>
        </header>

        {/* Only show this section if user is logged in */}
        {user && (
          <>
            {/* Flashcard Sets Section */}
            <div className="flex justify-between items-center mb-6 mt-8">
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
                        <div
                          key={set._id}
                          className="relative border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white"
                        >
                          {/* Share button moved to the top-right */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleShare(set._id);
                            }}
                            className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow transition duration-300 ease-in-out"
                            title="Share Set"
                          >
                            <FaShare size={16} />
                          </button>

                          {/* Card content */}
                          <h3 className="text-xl font-semibold mb-1 text-blue-600">{set.title}</h3>
                          <p className="text-gray-500 mb-2">Created by: {set.createdBy.username}</p>
                          <p className="text-gray-600 mb-3">{set.description}</p>

                          {/* Card details */}
                          <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>{set.cardCount} cards</span>
                            <span>Last updated: {new Date(set.updatedAt).toLocaleDateString()}</span>
                          </div>

                          {/* Replace the "View Set" with the share button */}
                          <div className="mt-3 text-right">
                            <Link href={`/flashcard-set/${set._id}`} className="text-blue-500 hover:text-blue-700">
                              View Set
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white rounded-md shadow-sm">
                      <p className="text-lg text-gray-700">No flashcard sets found. Create your first set!</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}

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
                      <span>{set.cardCount} cards</span>
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
      </div>
    </div>
  );
}