import { supabase } from "@/lib/supabase";
import type { Book } from "@/lib/supabase";
import BookList from "@/components/BookList";

async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching books:", error.message);
    return [];
  }
  return data as Book[];
}

export default async function Home() {
  const books = await getBooks();

  return (
    <div className="min-h-screen bg-cream-200">
      {/* Header */}
      <header className="bg-cream-100 border-b border-cream-300 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-3xl mb-2">📚</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brown-900">
            Book Recommendations
          </h1>
          <p className="text-brown-500 mt-2 text-sm md:text-base">
            Share a book you love and help build a reading list worth exploring.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <BookList initialBooks={books} />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-brown-300 text-xs">
        Made with love &amp; good books ♥
      </footer>
    </div>
  );
}
