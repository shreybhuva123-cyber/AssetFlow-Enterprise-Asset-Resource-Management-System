import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { aiAssistantService } from '@/lib/ai/assistant';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const prompt: unknown = body?.prompt;
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const response = await aiAssistantService.query(session.profile.orgId, prompt, session.profile.id);
    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
