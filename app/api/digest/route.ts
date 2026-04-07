import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDailyDigest } from "@/lib/email";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Books submitted since midnight PST today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: books, error } = await supabase
    .from("books")
    .select("*")
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!books || books.length === 0) {
    return NextResponse.json({
      message: "No books submitted today — skipping digest.",
    });
  }

  await sendDailyDigest(
    books.map((b) => ({
      title: b.title,
      author: b.author,
      recommender: b.recommender,
      note: b.note,
      coverUrl: b.cover_url,
      amazonUrl: b.amazon_url,
    }))
  );

  return NextResponse.json({
    message: `Digest sent with ${books.length} book${books.length !== 1 ? "s" : ""}.`,
  });
}
