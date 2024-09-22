"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const router = useRouter();

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

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this flashcard set?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/flashcard-sets/${params.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/');
        } else {
          alert('Failed to delete flashcard set');
        }
      } catch (error) {
        console.error('Error deleting flashcard set:', error);
        alert('An error occurred while deleting the flashcard set');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/flashcard-sets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashcardSet),
      });
      if (res.ok) {
        setIsEditing(false);
      } else {
        alert('Failed to update flashcard set');
      }
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      alert('An error occurred while updating the flashcard set');
    }
  };

  const handleInputChange = (e, index, field) => {
    const updatedCards = [...flashcardSet.cards];
    updatedCards[index][field] = e.target.value;
    setFlashcardSet({ ...flashcardSet, cards: updatedCards });
  };

  const handleAddCard = () => {
    setFlashcardSet({
      ...flashcardSet,
      cards: [...flashcardSet.cards, { term: '', definition: '' }]
    });
  };

  const handleRemoveCard = (index) => {
    const updatedCards = flashcardSet.cards.filter((_, i) => i !== index);
    setFlashcardSet({ ...flashcardSet, cards: updatedCards });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{flashcardSet.title}</h1>
      <p className="text-xl text-gray-600 mb-6">{flashcardSet.description}</p>
      
      <div className="mb-4">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Set'}
        </button>
        <button 
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Set
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={flashcardSet.title}
              onChange={(e) => setFlashcardSet({ ...flashcardSet, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <textarea
              value={flashcardSet.description}
              onChange={(e) => setFlashcardSet({ ...flashcardSet, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {flashcardSet.cards.map((card, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <input
                type="text"
                value={card.term}
                onChange={(e) => handleInputChange(e, index, 'term')}
                className="w-full px-3 py-2 border rounded-lg mb-2"
                placeholder="Term"
              />
              <input
                type="text"
                value={card.definition}
                onChange={(e) => handleInputChange(e, index, 'definition')}
                className="w-full px-3 py-2 border rounded-lg mb-2"
                placeholder="Definition"
              />
              <button
                type="button"
                onClick={() => handleRemoveCard(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Remove Card
              </button>
            </div>
          ))}
          <div className="flex flex-col items-start mb-4">
            <button
              type="button"
              onClick={handleAddCard}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              Add New Card
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
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
        </>
      )}
      <Link href="/" className="block mt-8 text-blue-500 hover:underline">Back to Home</Link>
    </div>
  );
}
