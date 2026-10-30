import { NextResponse } from "next/server";

import { applyEditorOrder } from "@/lib/store";

/** Hand the queue order back to the editor's ranking (unlocks every row the owner placed). */
export async function POST() {
  return NextResponse.json(await applyEditorOrder());
}
