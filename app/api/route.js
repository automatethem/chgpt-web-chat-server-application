import { NextRequest, NextResponse } from "next/server";

export async function GET(request) {
    const params = request.nextUrl.searchParams;
    //console.log(params);
    //const inputs = params.get("inputs");
    //console.log(inputs);
    //
    //console.log(request.url); //https://basic-api-nextjs-edge.vercel.app/api?inputs=Hello
    //const url = new URL(request.url);
    //const params = url.searchParams;
    //console.log(params);
    //const inputs = params.get("inputs");
    //console.log(inputs);
    
    //return new NextResponse("Hello", { headers: { 'Content-Type': 'text/plain' } });
    //return new NextResponse(JSON.stringify({ message: 'Hello' }), { headers: { "Content-Type": "application/json" } });
    return NextResponse.json({ message: 'Hello' });
}

export async function POST(request) {
    const json = await request.json();
    //console.log(json);
    //const intent = json["intent"]["name"];

    return NextResponse.json({ name: 'Hello' });
}

//export const runtime = 'nodejs' //디폴트 
//export const runtime = 'edge'
