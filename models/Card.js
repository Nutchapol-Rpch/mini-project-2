import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  term: { type: String, required: true },
  definition: { type: String, required: true },
  reference: { type: String },
  flashcardSet: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardSet', required: true },
});

export default mongoose.models.Card || mongoose.model('Card', CardSchema);