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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
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

  const startPractice = () => {
    setIsPracticeMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{flashcardSet.title}</h1>
      <p className="text-xl text-gray-600 mb-6">{flashcardSet.description}</p>
      
      {!isPracticeMode ? (
        <div>
          <button 
            onClick={startPractice}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Practice
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {flashcardSet.cards.map((card, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <h3 className="text-lg font-semibold mb-2">Term: {card.term}</h3>
                <p>Definition: {card.definition}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div 
            className="w-96 h-60 bg-white shadow-lg rounded-lg cursor-pointer mb-4 flex items-center justify-center"
            onClick={flipCard}
          >
            <div className="text-center p-4">
              {isFlipped 
                ? flashcardSet.cards[currentCardIndex].definition
                : flashcardSet.cards[currentCardIndex].term
              }
            </div>
          </div>
          <div className="flex justify-between w-96">
            <button 
              onClick={prevCard} 
              disabled={currentCardIndex === 0}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
            >
              Previous
            </button>
            <span className="py-2">
              {currentCardIndex + 1} / {flashcardSet.cards.length}
            </span>
            <button 
              onClick={nextCard}
              disabled={currentCardIndex === flashcardSet.cards.length - 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
            >
              Next
            </button>
          </div>
          <button 
            onClick={() => setIsPracticeMode(false)}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            End Practice
          </button>
        </div>
      )}
    </div>
  );
}
