import { ObjectId } from 'mongodb';

export interface ITodo {
  _id?: string | ObjectId;
  title: string;
  description?: string;
  status: 'todo' | 'pending' | 'complete';
  dueDate?: Date | string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
