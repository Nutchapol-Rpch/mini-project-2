import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';
import Card from '@/models/Card';

// Read FlashcardSet data model
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const isPublic = searchParams.get('isPublic');

  const query = {};
  if (userId) {
    query.createdBy = userId;
  }
  if (isPublic) {
    query.isPublic = true;
  }

  try {
    const flashcardSets = await FlashcardSet.find(query)
      .populate('createdBy', 'username email')
      .lean();

    const safeFlashcardSets = flashcardSets.map(set => ({
      ...set,
      createdBy: set.createdBy ? {
        _id: set.createdBy._id,
        username: set.createdBy.username,
        email: set.createdBy.email
      } : null
    }));

    return NextResponse.json(safeFlashcardSets);
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Create FlashcardSet data model
export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  console.log('Received data:', data);
  if (!data.createdBy) {
    return NextResponse.json({ error: 'createdBy field is required' }, { status: 400 });
  }
  try {
    const newFlashcardSet = new FlashcardSet({
      title: data.title,
      description: data.description,
      isPublic: data.isPublic,
      createdBy: data.createdBy,
      cards: [], // Initialize with an empty array
    });
    const savedSet = await newFlashcardSet.save();

    // Remove the card creation logic from here
    // as we're now handling it separately in the client-side code

    return NextResponse.json(savedSet, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    return NextResponse.json({ error: error.message || 'Failed to create flashcard set' }, { status: 500 });
  }
}
