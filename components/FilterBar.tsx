'use client';

import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  search,
  setSearch,
  status,
  setStatus,
  date,
  setDate,
  onClear,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 rounded-2xl glass-dark border border-white/5 shadow-2xl">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all placeholder:text-gray-500"
        />
      </div>

      <div className="flex gap-4">
        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="pl-11 pr-8 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none text-white transition-all cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Clear Filters */}
        {(search || status !== 'all' || date) && (
          <button
            onClick={onClear}
            className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
