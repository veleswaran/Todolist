'use client';

import { ITodo } from '@/lib/models/Todo';
import { Calendar, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TodoCardProps {
  todo: ITodo;
  onUpdate: (id: string, updates: Partial<ITodo>) => void;
  onDelete: (id: string) => void;
}

export default function TodoCard({ todo, onUpdate, onDelete }: TodoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'pending':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const toggleStatus = () => {
    const statusOrder: ITodo['status'][] = ['todo', 'pending', 'complete'];
    const currentIndex = statusOrder.indexOf(todo.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onUpdate(todo._id as string, { status: nextStatus });
  };

  return (
    <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 animate-fade-in shadow-xl hover:shadow-blue-500/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                todo.status
              )} flex items-center gap-2`}
            >
              {getStatusIcon(todo.status)}
              {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
            </span>
            {todo.dueDate && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(todo.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <h3 className={`text-lg font-semibold truncate ${todo.status === 'complete' ? 'line-through text-gray-500' : 'text-white'}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleStatus}
            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
            title="Next Status"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(todo._id as string)}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
