"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function Quiz() {
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFlashcardSet(params.id);
        setFlashcardSet(data);
      } catch (error) {
        console.error('Error fetching flashcard set:', error);
      }
    };

    fetchData();
  }, [params.id]);

  if (!flashcardSet) {
    return <div>Loading...</div>;
  }

  const handleSubmitAnswer = () => {
    const currentCard = flashcardSet.cards[currentCardIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentCard.definition.toLowerCase().trim();

    setAnswers([...answers, {
      term: currentCard.term,
      userAnswer,
      correctAnswer: currentCard.definition,
      isCorrect
    }]);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentCardIndex < flashcardSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setUserAnswer('');
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentCardIndex(0);
    setUserAnswer('');
    setQuizCompleted(false);
    setScore(0);
    setAnswers([]);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        {flashcardSet.title} - Quiz
      </h1>
      {!quizCompleted ? (
        <div className="bg-white shadow-lg rounded-xl p-8 transition transform hover:scale-105">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Question {currentCardIndex + 1} of {flashcardSet.cards.length}
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            {flashcardSet.cards[currentCardIndex].term}
          </p>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Type your answer here"
          />
          <button
            onClick={handleSubmitAnswer}
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-600 transition"
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-semibold text-green-700 mb-4">
            Quiz Completed!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Your score: {score} out of {flashcardSet.cards.length}
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Review:</h3>
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`mb-6 p-4 rounded-lg shadow ${answer.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}
            >
              <p className="font-semibold text-gray-800">
                {answer.term}
              </p>
              <p className="text-gray-600">
                Your answer: {answer.userAnswer}
              </p>
              {!answer.isCorrect && (
                <p className="text-green-600">
                  Correct answer: {answer.correctAnswer}
                </p>
              )}
            </div>
          ))}
          <div className="flex gap-4">
            <button
              onClick={restartQuiz}
              className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition"
            >
              Restart Quiz
            </button>
            <Link
              href={`/flashcard-set/${params.id}`}
              className="text-indigo-500 hover:underline self-center"
            >
              Back to Flashcard Set
            </Link>
          </div>
        </div>
      )}
    </div>
  );

}