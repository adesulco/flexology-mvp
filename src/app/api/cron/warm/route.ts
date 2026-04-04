export async function GET() {
  return Response.json({ status: 'warm', timestamp: Date.now() });
}
