import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';
import FlashcardSet from '@/models/FlashcardSet';

// Read Card data model
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const flashcardSetIds = searchParams.get('flashcardSetIds')?.split(',') || [];

  try {
    const cardCounts = await Card.aggregate([
      {
        $match: {
          flashcardSet: { $in: flashcardSetIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: '$flashcardSet',
          cardCount: { $sum: 1 },
          cards: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          flashcardSetId: '$_id',
          cardCount: 1,
          cards: 1,
          _id: 0
        }
      }
    ]);

    return NextResponse.json(cardCounts);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

// Create Card data model
export async function POST(request) {
  await dbConnect();
  const data = await request.json();

  try {
    const newCard = new Card({
      term: data.term,
      definition: data.definition,
      reference: data.reference,
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

// Delete Card data model for a flashcard set
export async function DELETE(request) {
  await dbConnect();
  const { flashcardSetId } = await request.json();

  try {
    // Delete existing cards for this flashcard set
    const result = await Card.deleteMany({ flashcardSet: flashcardSetId });

    return NextResponse.json({ message: 'Cards deleted successfully', deletedCount: result.deletedCount }, { status: 200 });
  } catch (error) {
    console.error('Error deleting cards:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete cards' }, { status: 500 });
  }
}

// Update Card data model
export async function PUT(request) {
  await dbConnect();
  const data = await request.json();

  try {
    // Delete existing cards for the flashcard set
    await Card.deleteMany({ flashcardSet: data.flashcardSetId });

    // Create new cards
    const newCards = await Card.insertMany(
      data.cards.map(card => ({
        ...card,
        flashcardSet: data.flashcardSetId
      }))
    );

    // Update the FlashcardSet with new card IDs
    await FlashcardSet.findByIdAndUpdate(
      data.flashcardSetId,
      { $set: { cards: newCards.map(card => card._id) } }
    );

    return NextResponse.json({ message: 'Cards updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating cards:', error);
    return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
  }
}
