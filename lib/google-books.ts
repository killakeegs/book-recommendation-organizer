export interface BookResult {
  googleId: string;
  title: string;
  author: string;
  year: string;
  coverUrl: string;
  summary: string;
}

export async function searchBooks(query: string): Promise<BookResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&printType=books&langRestrict=en`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item: Record<string, unknown>) => {
    const info = item.volumeInfo as Record<string, unknown>;
    const imageLinks = info.imageLinks as Record<string, string> | undefined;
    const authors = info.authors as string[] | undefined;
    const publishedDate = info.publishedDate as string | undefined;
    const description = info.description as string | undefined;

    return {
      googleId: item.id as string,
      title: (info.title as string) || "Unknown Title",
      author: authors?.[0] || "Unknown Author",
      year: publishedDate?.slice(0, 4) || "",
      coverUrl:
        imageLinks?.thumbnail?.replace("http:", "https:") ||
        imageLinks?.smallThumbnail?.replace("http:", "https:") ||
        "",
      summary: description
        ? description.slice(0, 400) + (description.length > 400 ? "…" : "")
        : "No description available.",
    };
  });
}
