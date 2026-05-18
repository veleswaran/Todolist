'use client';

import { useState, useEffect, useCallback } from 'react';
import TodoCard from '@/components/TodoCard';
import FilterBar from '@/components/FilterBar';
import AddTodoForm from '@/components/AddTodoForm';
import { ITodo } from '@/lib/models/Todo';
import { LayoutList, Loader2, Sparkles, AlertTriangle, Check } from 'lucide-react';
import { format } from 'date-fns';

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function Home() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState(getTodayString());
  const [overdueTasks, setOverdueTasks] = useState<ITodo[]>([]);
  const [showOverduePopup, setShowOverduePopup] = useState(false);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (status !== 'all') params.append('status', status);
      if (date) params.append('date', date);

      const res = await fetch(`/api/todos?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTodos(data);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, date]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTodos();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchTodos]);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const res = await fetch('/api/todos?overdue=true');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setOverdueTasks(data);
            setShowOverduePopup(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch overdue tasks:', error);
      }
    };
    fetchOverdue();
  }, []);

  const handleResolveOverdueTask = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'complete' }),
    });
    if (res.ok) {
      const updated = overdueTasks.filter((t) => t._id !== id);
      setOverdueTasks(updated);
      if (updated.length === 0) {
        setShowOverduePopup(false);
      }
      fetchTodos();
    }
  };

  const handleAddTodo = async (todoData: Partial<ITodo>) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData),
    });
    if (res.ok) {
      fetchTodos();
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<ITodo>) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      // Filter out tasks if their updated properties no longer match the current filter view
      if (updates.isDeleted === false && status === 'deleted') {
        setTodos(todos.filter((t) => t._id !== id));
      } else if (updates.status && status !== 'all' && status !== 'deleted' && updates.status !== status) {
        setTodos(todos.filter((t) => t._id !== id));
      } else {
        setTodos(todos.map((t) => (t._id === id ? { ...t, ...updates } : t)));
      }
    }
  };

  const handleDeleteTodo = async (id: string, permanent: boolean = false) => {
    const confirmMessage = permanent
      ? 'Are you sure you want to permanently delete this task? This action cannot be undone.'
      : 'Are you sure you want to delete this task?';
    
    if (!confirm(confirmMessage)) return;
    
    const url = permanent ? `/api/todos/${id}?permanent=true` : `/api/todos/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
    });
    if (res.ok) {
      setTodos(todos.filter((t) => t._id !== id));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setDate(getTodayString());
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
                <LayoutList className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-blue-500/80">Premium Manager</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
              Elevate Your <br className="hidden md:block" /> Productivity.
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto md:mx-0">
              A minimalist, high-performance todo system designed for modern workflows.
            </p>
          </div>
          
          <div className="glass-dark px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{todos.length}</p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {todos.filter(t => t.status === 'complete').length}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Done</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {todos.filter(t => t.status === 'todo' || t.status === 'pending').length}
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Open</p>
            </div>
          </div>
        </header>

        {/* Action Area */}
        <div className="space-y-8">
          <AddTodoForm onAdd={handleAddTodo} />
          
          <FilterBar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            date={date}
            setDate={setDate}
            onClear={clearFilters}
          />

          {/* Todo List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-medium animate-pulse">Syncing your tasks...</p>
              </div>
            ) : todos.length > 0 ? (
              todos.map((todo) => (
                <TodoCard
                  key={todo._id as string}
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-20 glass-dark rounded-3xl border border-dashed border-white/10">
                <div className="p-4 rounded-2xl bg-white/5 mb-4">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300">No tasks found</h3>
                <p className="text-gray-500 mt-2 max-w-xs">
                  {search || status !== 'all' || date 
                    ? "Try adjusting your filters to find what you're looking for." 
                    : "Your productivity journey starts here. Add your first task above!"}
                </p>
                {(search || status !== 'all' || date) && (
                  <button 
                    onClick={clearFilters}
                    className="mt-6 px-4 py-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
          <p>© 2026 Premium Todo System • Powered by Next.js & MongoDB</p>
        </footer>
        {/* Overdue Tasks Warning Popup Modal */}
        {showOverduePopup && overdueTasks.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="glass-dark border border-amber-500/20 max-w-lg w-full p-6 rounded-3xl shadow-2xl shadow-amber-500/5 space-y-6 animate-scale-in">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Prior Incomplete Tasks</h3>
                  <p className="text-xs text-amber-400/80 mt-0.5">
                    You have {overdueTasks.length} pending task{overdueTasks.length > 1 ? 's' : ''} from previous days.
                  </p>
                </div>
              </div>

              {/* Scrollable list of overdue tasks */}
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {overdueTasks.map((todo) => {
                  let overdueDays = 0;
                  if (todo.dueDate) {
                    const due = new Date(todo.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    due.setHours(0, 0, 0, 0);
                    const diffTime = today.getTime() - due.getTime();
                    overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  }

                  return (
                    <div
                      key={todo._id as string}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all flex items-start justify-between gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate text-sm">
                          {todo.title}
                        </h4>
                        {todo.dueDate && (
                          <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1">
                            Due: {format(new Date(todo.dueDate), 'MMM d, yyyy')}{' '}
                            {overdueDays > 0 && `(${overdueDays} day${overdueDays > 1 ? 's' : ''} ago)`}
                          </p>
                        )}
                        {todo.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1 leading-relaxed">
                            {todo.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleResolveOverdueTask(todo._id as string)}
                        className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200 cursor-pointer shadow-lg shadow-green-500/5 hover:scale-105"
                        title="Mark Complete"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowOverduePopup(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
