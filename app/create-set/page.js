"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      alert('You must be logged in to create a flashcard set');
      return;
    }
    const flashcardSet = {
      title,
      description,
      cards,
      isPublic,
      createdBy: user._id
    };
    console.log('Flashcard set to be created:', flashcardSet); // Add this line for debugging
    try {
      const response = await fetch('/api/flashcard-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashcardSet),
      });
      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
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
      <h1 className="text-4xl font-bold mb-6 text-center">Create New Flashcard Set</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-medium mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-lg font-medium mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2"
            />
            <span className="text-lg">Make this set public</span>
          </label>
        </div>

        <h2 className="text-3xl font-semibold mb-4">Cards</h2>
        {cards.map((card, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg shadow-sm">
            <div className="mb-4">
              <label htmlFor={`term-${index}`} className="block mb-1 text-lg font-medium">Term</label>
              <input
                type="text"
                id={`term-${index}`}
                value={card.term}
                onChange={(e) => handleCardChange(index, 'term', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor={`definition-${index}`} className="block mb-1 text-lg font-medium">Definition</label>
              <input
                type="text"
                id={`definition-${index}`}
                value={card.definition}
                onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddCard}
          className="mb-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Add Card
        </button>
        <div>
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            Create Flashcard Set
          </button>
        </div>
      </form>
      <Link href="/" className="block mt-8 text-blue-500 hover:underline text-center">Back to Home</Link>
    </div>
  );

}
