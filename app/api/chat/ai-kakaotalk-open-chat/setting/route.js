import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
    const { data: kakaotalkOpenChatSetting } = await supabase
    .from('AiKakaotalkOpenChatSetting')
    .select('*')
    .single();
    
    return NextResponse.json(kakaotalkOpenChatSetting);
}

//export const runtime = "nodejs" //디폴트
export const runtime = "edge"

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;
