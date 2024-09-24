import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';

export async function GET(request, { params }) {
  await dbConnect();
  const flashcardSet = await FlashcardSet.findById(params.id).populate('createdBy', 'username email');
  if (!flashcardSet) {
    return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
  }
  return NextResponse.json(flashcardSet);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const data = await request.json();
  const updatedFlashcardSet = await FlashcardSet.findByIdAndUpdate(params.id, data, { new: true });
  if (!updatedFlashcardSet) {
    return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
  }
  return NextResponse.json(updatedFlashcardSet);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const deletedFlashcardSet = await FlashcardSet.findByIdAndDelete(params.id);
  if (!deletedFlashcardSet) {
    return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Flashcard set deleted successfully' });
}
