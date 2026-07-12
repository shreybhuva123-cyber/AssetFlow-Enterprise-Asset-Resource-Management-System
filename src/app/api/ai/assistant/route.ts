import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { aiAssistantService } from '@/lib/ai/assistant';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.profile.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const response = await aiAssistantService.query(session.profile.orgId, prompt, session.profile.id);
    
    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
