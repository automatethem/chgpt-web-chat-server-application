import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";
import fs from "fs";
import json2csv from "json2csv";
 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const format = params.get("format") || "json";

  let { data: members, error } = await supabase
    .from('AiKakaotalkOpenChatMember')
    .select('*');

  if (error) {
    console.error(error);
    return new NextResponse("Server Error", { status: 500 });
  }

  if (format === "csv") {
    const json2csvParser = new json2csv.Parser({ header: true });
    const csv = json2csvParser.parse(members);

    const responseHeaders = {
        'Content-Disposition': `attachment; filename="members.csv"`,
        'Content-Type': 'text/csv',
    };
    return new NextResponse(csv, { headers: responseHeaders });
  } 
  else {
    const responseHeaders = {
        'Content-Disposition': `attachment; filename="members.json"`,
        'Content-Type': 'application/json',
    };
    return new NextResponse(JSON.stringify(members), { headers: responseHeaders });
  }
}

//export const runtime = 'nodejs' //디폴트 
//export const runtime = 'edge'

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;
