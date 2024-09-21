import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  let query = { $or: [{ isPublic: true }] };
  if (userId) {
    query.$or.push({ createdBy: userId });
  }

  const flashcardSets = await FlashcardSet.find(query);
  return NextResponse.json(flashcardSets);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const newFlashcardSet = new FlashcardSet(data);
  await newFlashcardSet.save();
  return NextResponse.json(newFlashcardSet, { status: 201 });
}
