'use client';

import { useState } from 'react';
import { ITodo } from '@/lib/models/Todo';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, RotateCcw, MessageSquare, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';

interface TodoCardProps {
  todo: ITodo;
  onUpdate: (id: string, updates: Partial<ITodo>) => void;
  onDelete: (id: string, permanent?: boolean) => void;
}

export default function TodoCard({ todo, onUpdate, onDelete }: TodoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<ITodo['status']>(todo.status);
  const [modalNote, setModalNote] = useState(todo.statusNote || '');

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

  const handleOpenModal = () => {
    setModalStatus(todo.status);
    setModalNote(todo.statusNote || '');
    setIsModalOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(todo._id as string, {
      status: modalStatus,
      statusNote: modalNote.trim(),
    });
    setIsModalOpen(false);
  };

  return (
    <div className={`group relative p-6 rounded-2xl border transition-all duration-300 animate-fade-in shadow-xl ${
      todo.isDeleted
        ? 'bg-red-950/10 border-red-500/20 hover:border-red-500/40 shadow-red-500/5'
        : 'bg-white/5 border-white/10 hover:border-blue-500/30 hover:shadow-blue-500/5'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {todo.isDeleted ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium border text-red-500 bg-red-500/10 border-red-500/20 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Deleted
              </span>
            ) : (
              <button
                onClick={handleOpenModal}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  todo.status
                )} flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer`}
                title="Change Status & Note"
              >
                {getStatusIcon(todo.status)}
                {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
              </button>
            )}
            {todo.dueDate && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(todo.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <h3 className={`text-lg font-semibold truncate ${
            todo.isDeleted
              ? 'text-gray-500 line-through'
              : todo.status === 'complete'
                ? 'line-through text-gray-500'
                : 'text-white'
          }`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}

          {/* Status Note section */}
          {!todo.isDeleted && todo.statusNote && (
            <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/80 flex items-start gap-2 group/note">
              <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold block text-blue-400 mb-0.5">Status Note</span>
                <p className="break-words leading-relaxed text-gray-300">{todo.statusNote}</p>
              </div>
              <button
                onClick={handleOpenModal}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-blue-400 opacity-0 group-hover/note:opacity-100 transition-opacity"
                title="Edit Note"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-2 transition-opacity ${
          todo.isDeleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {todo.isDeleted ? (
            <>
              <button
                onClick={() => onUpdate(todo._id as string, { isDeleted: false })}
                className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors cursor-pointer"
                title="Restore Task"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(todo._id as string, true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete Permanently"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleOpenModal}
                className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                title="Update Status / Note"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(todo._id as string, false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sleek, Premium Glassmorphic Status & Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="glass-dark max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Update Status</h3>
                <p className="text-xs text-gray-400 mt-1 truncate max-w-[280px]">For: {todo.title}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-6">
              {/* Custom Status Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['todo', 'pending', 'complete'] as ITodo['status'][]).map((statusVal) => {
                    const isActive = modalStatus === statusVal;
                    return (
                      <button
                        key={statusVal}
                        type="button"
                        onClick={() => setModalStatus(statusVal)}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                          isActive
                            ? statusVal === 'complete'
                              ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-lg shadow-green-500/5'
                              : statusVal === 'pending'
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/5'
                                : 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/5'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        {getStatusIcon(statusVal)}
                        <span>{statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Note input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Status Note <span className="text-gray-600 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="e.g. Completed phase 1, waiting for client response, etc."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-sm shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
