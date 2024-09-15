import mongoose from 'mongoose';

const FlashcardSetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  cards: [
    {
      term: { type: String, required: true },
      definition: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.FlashcardSet || mongoose.model('FlashcardSet', FlashcardSetSchema);
