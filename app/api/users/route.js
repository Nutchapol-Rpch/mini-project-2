import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import path from 'path';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';

// Login route (Read user data model)
export async function POST(request) {
  await dbConnect();
  const { email, password } = await request.json();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful', user: { _id: user._id, name: user.username, email: user.email } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Update profile route (Update user data model)
export async function PATCH(request) {
  await dbConnect();
  const formData = await request.formData();
  const email = formData.get('email');
  const username = formData.get('username');
  const password = formData.get('password');
  const profilePicture = formData.get('profilePicture');

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.username = username;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (profilePicture) {
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const stream = Readable.from(buffer);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'profile_pictures' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.pipe(uploadStream);
      });

      user.profilePicture = result.secure_url;
    }

    user.lastEditedAt = new Date();

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        lastEditedAt: user.lastEditedAt
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Fetch user profile by email (Read user data model)
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        lastEditedAt: user.lastEditedAt
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Delete user account (Delete user data model)
export async function DELETE(request) {
  await dbConnect();
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all flashcard sets created by the user
    await FlashcardSet.deleteMany({ createdBy: userId });

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
