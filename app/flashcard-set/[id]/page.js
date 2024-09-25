"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';

async function getFlashcardSet(id) {
  const res = await fetch(`/api/flashcard-sets/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch flashcard set');
  }
  const flashcardSet = await res.json();

  const cardRes = await fetch(`/api/card?flashcardSetIds=${id}`, { cache: 'no-store' });
  if (!cardRes.ok) {
    throw new Error('Failed to fetch cards');
  }
  const cardData = await cardRes.json();

  if (cardData.length > 0) {
    flashcardSet.cardCount = cardData[0].cardCount;
    flashcardSet.cards = cardData[0].cards;
  } else {
    flashcardSet.cardCount = 0;
    flashcardSet.cards = [];
  }

  return flashcardSet;
}

export default function FlashcardSet() {
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCards, setEditedCards] = useState([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedIsPublic, setEditedIsPublic] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFlashcardSet(params.id);
        setFlashcardSet(data);
        setEditedCards(data.cards || []);
        setEditedTitle(data.title);
        setEditedDescription(data.description);
        setEditedIsPublic(data.isPublic);
      } catch (error) {
        console.error('Error fetching flashcard set:', error);
      }
    };

    fetchData();
  }, [params.id]);

  if (!flashcardSet) {
    return <div>Loading...</div>;
  }

  const isOwner = user && flashcardSet.createdBy._id === user._id;

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
          console.error('Failed to delete flashcard set');
        }
      } catch (error) {
        console.error('Error deleting flashcard set:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCards(flashcardSet.cards);
    setEditedTitle(flashcardSet.title);
    setEditedDescription(flashcardSet.description);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/flashcard-sets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
          cards: editedCards,
          isPublic: editedIsPublic,
        }),
      });
      if (res.ok) {
        const updatedSet = await res.json();
        setFlashcardSet(updatedSet);
        setIsEditing(false);
      } else {
        console.error('Failed to update flashcard set');
      }
    } catch (error) {
      console.error('Error updating flashcard set:', error);
    }
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...editedCards];
    newCards[index][field] = value;
    setEditedCards(newCards);
  };

  const handleAddCard = () => {
    setEditedCards([...editedCards, { term: '', definition: '' }]);
  };

  const handleRemoveCard = (index) => {
    const newCards = [...editedCards];
    newCards.splice(index, 1);
    setEditedCards(newCards);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditing ? (
        <form onSubmit={handleSaveChanges}>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-3xl font-bold mb-4 w-full"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-xl text-gray-600 mb-6 w-full"
          />
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editedIsPublic}
                onChange={(e) => setEditedIsPublic(e.target.checked)}
                className="mr-2"
              />
              Make this set public
            </label>
          </div>
          {editedCards.map((card, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={card.term}
                onChange={(e) => handleCardChange(index, 'term', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-2"
                placeholder="Term"
              />
              <textarea
                value={card.definition}
                onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Definition"
              />
              <button
                type="button"
                onClick={() => handleRemoveCard(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
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
            <div className="flex flex-col space-y-2 w-full">
              <button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">{flashcardSet.title}</h1>
          <p className="text-xl text-gray-600 mb-2">Created by: {flashcardSet.createdBy.username}</p>
          <p className="text-xl text-gray-600 mb-6">{flashcardSet.description}</p>
          {isOwner && (
            <div className="mb-4">
              <button 
                onClick={handleEdit}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Edit Set
              </button>
              <button 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete Set
              </button>
            </div>
          )}
          {!isPracticeMode ? (
            <div>
              <button 
                onClick={startPractice}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
              >
                Start Practice
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {flashcardSet.cards && flashcardSet.cards.length > 0 ? (
                  flashcardSet.cards.map((card, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <h3 className="text-lg font-semibold mb-2">Term: {card.term}</h3>
                      <p>Definition: {card.definition}</p>
                    </div>
                  ))
                ) : (
                  <p>No cards available for this flashcard set.</p>
                )}
              </div>
            </div>
          ) : (
            isPracticeMode && flashcardSet.cards && flashcardSet.cards.length > 0 && (
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
            )
          )}
        </>
      )}
      <Link href="/" className="block mt-8 text-blue-500 hover:underline">Back to Home</Link>
    </div>
  );
}
