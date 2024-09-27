"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function CreateSet() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([{ term: '', definition: '', reference: '' }]);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleAddCard = () => {
    setCards([...cards, { term: '', definition: '', reference: '' }]);
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
              reference: card.reference,
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
    <div className="container mx-auto max-w-2xl px-6 py-10 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Create New Flashcard Set</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the title of your flashcard set"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your flashcard set (optional)"
          />
        </div>

        {/* Public Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
          />
          <label className="text-lg font-medium text-gray-700">Make this set public</label>
        </div>

        {/* Flashcard Inputs */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-8">Flashcards</h2>
        {cards.map((card, index) => (
          <div key={index} className="flex flex-col space-y-4 mb-4">
            <input
              type="text"
              value={card.term}
              onChange={(e) => handleCardChange(index, 'term', e.target.value)}
              placeholder="Term"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={card.definition}
              onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
              placeholder="Definition"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={card.reference}
              onChange={(e) => handleCardChange(index, 'reference', e.target.value)}
              placeholder="Reference (Media URL)"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveCard(index)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add Card Button */}
        <button
          type="button"
          onClick={handleAddCard}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Card
        </button>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600"
          >
            Create Flashcard Set
          </button>
        </div>
      </form>

      {/* Back to Home Link */}
      <Link href="/" className="block mt-8 text-center text-blue-500 hover:underline">
        Back to Home
      </Link>
    </div>
  );

}
