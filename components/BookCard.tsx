"use client";

import { useState } from "react";
import Image from "next/image";
import type { Book } from "@/lib/supabase";

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const [expanded, setExpanded] = useState(false);

  const summary = book.summary || "";
  const isLong = summary.length > 200;
  const displaySummary =
    isLong && !expanded ? summary.slice(0, 200) + "…" : summary;

  const dateStr = new Date(book.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-cream-100 rounded-2xl shadow-sm border border-cream-300 p-5 flex gap-4 hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="shrink-0">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            width={64}
            height={90}
            className="rounded-lg object-cover shadow-sm"
            style={{ width: 64, height: 90 }}
          />
        ) : (
          <div className="w-16 h-[90px] bg-cream-300 rounded-lg flex items-center justify-center text-2xl shadow-sm">
            📚
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="font-serif font-bold text-brown-900 text-lg leading-tight">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-brown-500 text-sm mt-0.5">by {book.author}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-brown-300">
          <span className="font-medium text-brown-500">
            Recommended by{" "}
            <span className="text-amber-dark font-semibold">
              {book.recommender}
            </span>
          </span>
          <span>·</span>
          <span>{dateStr}</span>
        </div>

        {book.note && (
          <p className="mt-2 text-sm text-brown-700 italic leading-relaxed">
            &ldquo;{book.note}&rdquo;
          </p>
        )}

        {summary && (
          <div className="mt-2">
            <p className="text-sm text-brown-500 leading-relaxed">
              {displaySummary}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-amber-brand hover:text-amber-dark mt-1 underline cursor-pointer"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {book.amazon_url && (
          <a
            href={book.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-semibold text-amber-dark hover:text-amber-brand border border-amber-brand/40 hover:border-amber-brand px-3 py-1 rounded-full transition-colors"
          >
            Find on Amazon →
          </a>
        )}
      </div>
    </div>
  );
}
