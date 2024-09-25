import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const flashcardSetIds = searchParams.get('flashcardSetIds')?.split(',') || [];

  try {
    const cardCounts = await Card.aggregate([
      { $match: { flashcardSet: { $in: flashcardSetIds.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$flashcardSet', count: { $sum: 1 } } }
    ]);

    const result = flashcardSetIds.map(id => ({
      flashcardSetId: id,
      cardCount: cardCounts.find(count => count._id.toString() === id)?.count || 0
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching card counts:', error);
    return NextResponse.json({ error: 'Failed to fetch card counts' }, { status: 500 });
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
