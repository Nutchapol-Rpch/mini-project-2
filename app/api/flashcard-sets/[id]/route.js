import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';
import Card from '@/models/Card';

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const flashcardSet = await FlashcardSet.findById(id)
      .populate('createdBy', 'username email')
      .populate('cards')
      .lean();

    if (!flashcardSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    // Sanitize the user data
    const safeFlashcardSet = {
      ...flashcardSet,
      createdBy: flashcardSet.createdBy ? {
        _id: flashcardSet.createdBy._id,
        username: flashcardSet.createdBy.username,
        email: flashcardSet.createdBy.email
      } : null
    };

    return NextResponse.json(safeFlashcardSet);
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Update FlashcardSet data model
export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await request.json();

  try {
    const updatedSet = await FlashcardSet.findByIdAndUpdate(id, 
      { 
        title: data.title, 
        description: data.description, 
        isPublic: data.isPublic 
      }, 
      { new: true }
    ).populate('createdBy', 'username email').lean();

    if (!updatedSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSet);
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Delete FlashcardSet data model
export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    // Delete all associated cards first
    await Card.deleteMany({ flashcardSet: id });

    // Then delete the flashcard set
    const deletedSet = await FlashcardSet.findByIdAndDelete(id);

    if (!deletedSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Flashcard set and associated cards deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard set and cards:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
