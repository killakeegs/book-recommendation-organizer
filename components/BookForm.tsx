"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Book } from "@/lib/supabase";

interface BookResult {
  googleId: string;
  title: string;
  author: string;
  year: string;
  coverUrl: string;
  summary: string;
}

interface Props {
  onBookAdded: (book: Book) => void;
}

export default function BookForm({ onBookAdded }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<BookResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookResult | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(q.trim())}`
      );
      const data: BookResult[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedBook(null);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const selectBook = (book: BookResult) => {
    setSelectedBook(book);
    setQuery(`${book.title} — ${book.author}${book.year ? ` (${book.year})` : ""}`);
    setShowDropdown(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectBook(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedBook) {
      setError("Please select a book from the suggestions.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedBook.title,
          author: selectedBook.author,
          coverUrl: selectedBook.coverUrl,
          summary: selectedBook.summary,
          recommender: name.trim(),
          note: note.trim() || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Something went wrong. Please try again.");
        return;
      }

      const book: Book = await res.json();
      onBookAdded(book);
      setSuccess(true);
      setQuery("");
      setSelectedBook(null);
      setName("");
      setNote("");
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-100 rounded-2xl shadow-md border border-cream-300 p-6 md:p-8">
      <h2 className="font-serif text-2xl font-bold text-brown-900 mb-1">
        Recommend a Book
      </h2>
      <p className="text-brown-500 text-sm mb-6">
        Type a title below and pick your book from the suggestions.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <div className="mb-5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-brown-700 mb-1"
          >
            Your Name <span className="text-amber-brand">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah"
            className="w-full px-4 py-2.5 rounded-xl border border-cream-400 bg-cream-50 text-brown-900 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-amber-brand focus:border-transparent transition"
          />
        </div>

        {/* Book search */}
        <div className="mb-5" ref={containerRef}>
          <label
            htmlFor="book-search"
            className="block text-sm font-medium text-brown-700 mb-1"
          >
            Book Title <span className="text-amber-brand">*</span>
          </label>
          <div className="relative">
            <input
              id="book-search"
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Start typing a title…"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-400 bg-cream-50 text-brown-900 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-amber-brand focus:border-transparent transition"
            />
            {loadingSuggestions && (
              <div className="absolute right-3 top-3">
                <div className="w-5 h-5 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul
                className="absolute z-50 mt-1 w-full bg-cream-50 border border-cream-300 rounded-xl shadow-lg overflow-hidden"
                role="listbox"
              >
                {suggestions.map((book, i) => (
                  <li
                    key={book.googleId}
                    role="option"
                    aria-selected={i === highlightedIndex}
                    onMouseDown={() => selectBook(book)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      i === highlightedIndex
                        ? "bg-amber-brand/10"
                        : "hover:bg-cream-200"
                    } ${i !== 0 ? "border-t border-cream-300" : ""}`}
                  >
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        width={32}
                        height={44}
                        className="rounded object-cover shrink-0"
                        style={{ height: 44, width: 32 }}
                      />
                    ) : (
                      <div className="w-8 h-11 bg-cream-300 rounded shrink-0 flex items-center justify-center text-brown-300 text-xs">
                        📖
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brown-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-brown-500 truncate">
                        {book.author}
                        {book.year ? ` · ${book.year}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Selected book preview */}
          {selectedBook && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-amber-brand/10 border border-amber-brand/30 rounded-xl">
              {selectedBook.coverUrl && (
                <Image
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  width={36}
                  height={50}
                  className="rounded object-cover shrink-0"
                  style={{ height: 50, width: 36 }}
                />
              )}
              <div>
                <p className="text-sm font-semibold text-brown-900">
                  ✓ {selectedBook.title}
                </p>
                <p className="text-xs text-brown-500">{selectedBook.author}</p>
              </div>
            </div>
          )}
        </div>

        {/* Personal note */}
        <div className="mb-6">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-brown-700 mb-1"
          >
            Why do you love it?{" "}
            <span className="text-brown-300 font-normal">(optional)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={`e.g. "This one genuinely changed how I think about habits."`}
            className="w-full px-4 py-2.5 rounded-xl border border-cream-400 bg-cream-50 text-brown-900 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-amber-brand focus:border-transparent transition resize-none"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 bg-amber-brand hover:bg-amber-dark text-cream-50 font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? "Adding…" : "Submit Recommendation"}
        </button>

        {success && (
          <p className="mt-4 text-center text-sm text-amber-dark font-medium">
            🎉 Thanks! Your recommendation was added.
          </p>
        )}
      </form>
    </div>
  );
}
