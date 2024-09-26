"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../context/UserContext';

export default function CreateSet() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([{ term: '', definition: '' }]);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleAddCard = () => {
    setCards([...cards, { term: '', definition: '' }]);
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleRemoveCard = (index) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      alert('You must be logged in to create a flashcard set');
      return;
    }
    const flashcardSet = {
      title,
      description,
      isPublic,
      createdBy: user._id,
    };
    try {
      // Create the flashcard set
      const setResponse = await fetch('/api/flashcard-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashcardSet),
      });
      if (setResponse.ok) {
        const createdSet = await setResponse.json();
        
        // Create cards for the flashcard set
        const validCards = cards.filter(card => card.term.trim() !== '' && card.definition.trim() !== '');
        const cardPromises = validCards.map(card => 
          fetch('/api/card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              term: card.term,
              definition: card.definition,
              flashcardSetId: createdSet._id
            }),
          })
        );
        
        await Promise.all(cardPromises);
        
        router.push('/');
      } else {
        const errorData = await setResponse.json();
        console.error('Server response:', errorData);
        alert(errorData.error || 'Failed to create flashcard set');
      }
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      alert('An error occurred while creating the flashcard set');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Flashcard Set</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            Make this set public
          </label>
        </div>
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        {cards.map((card, index) => (
          <div key={index} className="mb-4 flex items-center">
            <input
              type="text"
              value={card.term}
              onChange={(e) => handleCardChange(index, 'term', e.target.value)}
              placeholder="Term"
              className="border rounded p-2 mr-2 flex-1"
            />
            <input
              type="text"
              value={card.definition}
              onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
              placeholder="Definition"
              className="border rounded p-2 mr-2 flex-1"
            />
            <button
              type="button"
              onClick={() => handleRemoveCard(index)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddCard}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Card
        </button>
        <div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Create Flashcard Set
          </button>
        </div>
      </form>
      <Link href="/" className="block mt-8 text-blue-500 hover:underline">Back to Home</Link>
    </div>
  );
}
