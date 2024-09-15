# FlashLearn: Interactive Flashcard Learning Platform

## Project Overview

FlashLearn is an interactive web application designed to help users create, study, and master flashcards. This project was developed as part of a term project to demonstrate proficiency in modern web development technologies and practices.

## Features

- User authentication (login and registration)
- Create and manage flashcard sets
- Study flashcards with an intuitive interface
- Search functionality for flashcard sets
- Responsive design for various devices

## Technologies Used

- Next.js 13 (React framework)
- MongoDB (Database)
- Tailwind CSS (Styling)
- Next.js API Routes (Backend API)
- bcrypt (Password hashing)

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/flashlearn.git
   ```

2. Install dependencies:
   ```
   cd flashlearn
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js 13 app directory
  - `api/`: API routes
  - `components/`: Reusable React components
  - `models/`: MongoDB schemas
  - `lib/`: Utility functions and database connection
- `public/`: Static assets

## Future Enhancements

- Implement spaced repetition algorithm for optimized learning
- Add collaborative features for sharing flashcard sets
- Integrate with external APIs for automatic flashcard generation

## Contributors

- Nuthchapol Rodpholchoo 6511012
- Nantiya sachdev 6511464
- Chinnapat Premudomkit 6520238

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
