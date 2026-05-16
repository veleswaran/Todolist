import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const { id } = await params;
    const data = await request.json();

    // Remove _id from data if it exists to avoid update errors
    delete data._id;
    data.updatedAt = new Date();

    // Convert string dates back to Date objects if necessary
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const { id } = await params;

    // Soft delete as requested (create delete flag)
    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Todo marked as deleted', todo: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
