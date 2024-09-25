import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const flashcardSetIds = searchParams.get('flashcardSetIds')?.split(',') || [];

  try {
    const cards = await Card.find({ flashcardSet: { $in: flashcardSetIds } })
      .populate('flashcardSet', 'title description isPublic createdBy')
      .populate('flashcardSet.createdBy', 'username');

    // Group cards by flashcard set
    const groupedCards = cards.reduce((acc, card) => {
      if (!acc[card.flashcardSet._id]) {
        acc[card.flashcardSet._id] = {
          ...card.flashcardSet.toObject(),
          cards: []
        };
      }
      acc[card.flashcardSet._id].cards.push(card);
      return acc;
    }, {});

    return NextResponse.json(Object.values(groupedCards));
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();

  try {
    const newCard = new Card({
      term: data.term,
      definition: data.definition,
      flashcardSet: data.flashcardSetId,
    });

    const savedCard = await newCard.save();

    // Update the FlashcardSet to include the new card
    await FlashcardSet.findByIdAndUpdate(
      data.flashcardSetId,
      { $push: { cards: savedCard._id } }
    );

    return NextResponse.json(savedCard, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: error.message || 'Failed to create card' }, { status: 500 });
  }
}
