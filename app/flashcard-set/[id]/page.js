"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

async function getFlashcardSet(id) {
  const res = await fetch(`http://localhost:3000/api/flashcard-sets/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch flashcard set');
  }
  return res.json();
}

export default function FlashcardSet() {
  const [flashcardSet, setFlashcardSet] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFlashcardSet(params.id);
        setFlashcardSet(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [params.id]);

  if (!flashcardSet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{flashcardSet.title}</h1>
      <p className="text-xl text-gray-600 mb-6">{flashcardSet.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSet.cards.map((card, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">Term: {card.term}</h3>
            <p>Definition: {card.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
