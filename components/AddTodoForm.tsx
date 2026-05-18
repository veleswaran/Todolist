'use client';

import { useState } from 'react';
import { Plus, X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { ITodo } from '@/lib/models/Todo';

interface AddTodoFormProps {
  onAdd: (todo: Partial<ITodo>) => Promise<void>;
}

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: getTodayString(),
    status: 'todo' as ITodo['status'],
    category: 'personal' as ITodo['category'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    try {
      await onAdd(formData);
      setFormData({
        title: '',
        description: '',
        dueDate: getTodayString(),
        status: 'todo',
        category: 'personal',
      });
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2 font-medium group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Add New Task
      </button>
    );
  }

  return (
    <div className="p-6 rounded-2xl glass-dark border border-blue-500/20 shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Create New Task</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
          <input
            autoFocus
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add some details..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, category: 'personal' })}
              className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                formData.category === 'personal'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/5'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-purple-500 ${formData.category === 'personal' ? 'animate-pulse' : ''}`} />
              Personal
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, category: 'work' })}
              className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                formData.category === 'work'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-indigo-500 ${formData.category === 'work' ? 'animate-pulse' : ''}`} />
              Work
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Due Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ITodo['status'] })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all appearance-none"
            >
              <option value="todo">Todo</option>
              <option value="pending">Pending</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Task
            </>
          )}
        </button>
      </form>
    </div>
  );
}
