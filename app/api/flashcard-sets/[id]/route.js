import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashcardSet from '@/models/FlashcardSet';

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

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  const data = await request.json();

  try {
    const updatedSet = await FlashcardSet.findByIdAndUpdate(id, data, { new: true })
      .populate('createdBy', 'username email')
      .lean();

    if (!updatedSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    // Update cards
    if (data.cards) {
      await Promise.all(data.cards.map(async (card) => {
        if (card._id) {
          await Card.findByIdAndUpdate(card._id, card);
        } else {
          const newCard = new Card({ ...card, flashcardSet: id });
          await newCard.save();
        }
      }));
    }

    return NextResponse.json(updatedSet);
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const deletedSet = await FlashcardSet.findByIdAndDelete(id);

    if (!deletedSet) {
      return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
    }

    // Delete associated cards
    await Card.deleteMany({ flashcardSet: id });

    return NextResponse.json({ message: 'Flashcard set deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
