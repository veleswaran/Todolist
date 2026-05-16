import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const query: {
      isDeleted: boolean;
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
      status?: string;
      dueDate?: { $gte: Date; $lte: Date };
    } = { isDeleted: false };

    // Like query for title or description
    const q = searchParams.get('q');
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      query.status = status;
    }

    // Date filter
    const date = searchParams.get('date');
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const todos = await db
      .collection('todos')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(todos);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const data = await request.json();

    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newTodo = {
      title: data.title,
      description: data.description,
      status: data.status || 'todo',
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('todos').insertOne(newTodo);
    const todo = { ...newTodo, _id: result.insertedId };

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
