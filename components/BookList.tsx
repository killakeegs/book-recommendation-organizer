"use client";

import { useState, useEffect } from "react";
import BookCard from "./BookCard";
import BookForm from "./BookForm";
import type { Book } from "@/lib/supabase";

export default function BookList({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);

  // Keep in sync if the component remounts
  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  const handleBookAdded = (book: Book) => {
    setBooks((prev) => [book, ...prev]);
  };

  return (
    <>
      <BookForm onBookAdded={handleBookAdded} />

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-brown-900">
            The Reading List
          </h2>
          {books.length > 0 && (
            <span className="text-sm text-brown-300 bg-cream-300 px-3 py-1 rounded-full">
              {books.length} book{books.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16 text-brown-300">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-lg font-serif text-brown-500">
              No recommendations yet.
            </p>
            <p className="text-sm mt-1">Be the first to add one!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
