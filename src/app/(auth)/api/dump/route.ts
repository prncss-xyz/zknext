import { dump } from "@/server/actions";

export async function GET() {
  const message = await dump();
  return Response.json(message);
}
