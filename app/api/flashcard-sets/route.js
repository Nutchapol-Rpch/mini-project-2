import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';

export async function GET() {
  await dbConnect();
  const flashcardSets = await FlashcardSet.find({});
  return NextResponse.json(flashcardSets);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const newFlashcardSet = new FlashcardSet(data);
  await newFlashcardSet.save();
  return NextResponse.json(newFlashcardSet, { status: 201 });
}
