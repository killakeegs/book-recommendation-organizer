import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, author, coverUrl, summary, recommender, note } = body;

  if (!title?.trim() || !recommender?.trim()) {
    return NextResponse.json(
      { error: "Title and recommender name are required." },
      { status: 400 }
    );
  }

  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
    `${title} ${author || ""}`
  )}`;

  const { data, error } = await supabase
    .from("books")
    .insert([
      {
        title: title.trim(),
        author: author || null,
        cover_url: coverUrl || null,
        summary: summary || null,
        amazon_url: amazonUrl,
        recommender: recommender.trim(),
        note: note?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
