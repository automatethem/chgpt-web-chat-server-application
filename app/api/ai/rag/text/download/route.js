import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const id = params.get("id");

  const { data: aiRagText, error } = await supabase
    .from('AiRagText')
    .select('*')
    .match({'id': id})
    .single();

  const { title, message } = aiRagText;

  // 파일 이름 인코딩
  const encodedTitle = encodeURIComponent(title);

  const responseHeaders = {
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedTitle}.txt`,
      'Content-Type': 'text/plain',
  };
  return new NextResponse(message, { headers: responseHeaders });
}

//export const runtime = 'nodejs' //디폴트 
//export const runtime = 'edge'

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;
