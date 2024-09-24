import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const flashcardSets = await FlashcardSet.find({ createdBy: userId }).populate('createdBy', 'username email');
    return NextResponse.json(flashcardSets);
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  console.log('Received data:', data);  // Keep this line for debugging
  if (!data.createdBy) {
    return NextResponse.json({ error: 'createdBy field is required' }, { status: 400 });
  }
  const newFlashcardSet = new FlashcardSet(data);
  try {
    const savedSet = await newFlashcardSet.save();
    return NextResponse.json(savedSet, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    return NextResponse.json({ error: error.message || 'Failed to create flashcard set' }, { status: 500 });
  }
}
