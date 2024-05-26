import LangchainAgentHandler from "../../lib/langchain-agent-handler.js";
import { NextRequest, NextResponse } from "next/server";
import { SystemMessage, AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "langchain/prompts";
//import createCoinPriceTool from "../../lib/langchain-agent-tools/coin-price-tool.js"
//import createWebbrowserTool from "../../lib/langchain-agent-tools/webbrowser-tool.js"
//import createTavilysearchTool from "../../lib/langchain-agent-tools/tavilysearch-tool.js"
import createDummyTool from "../../lib/langchain-agent-tools/dummy-tool.js"
import { RequestsGetTool, RequestsPostTool } from "langchain/tools";
import createChatgptPluginAsyncTool from "../../lib/langchain-agent-tools/chatgpt-plugin-async-tool.js"
import { createClient } from '@supabase/supabase-js'

var langchainAgentHandler = null;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

//https://speckofdust.tistory.com/178
function numToEng(number) {
    if (number > 1000000000000000) {
        number = number / 1000000000000000;
        return `${number.toFixed(1).toLocaleString('en-US')}Q`
    }
    else if (number > 1000000000000) {
        number = Math.round(number / 1000000000000);
        return `${number.toFixed(1).toLocaleString('en-US')}T`
    }
    else if (number > 1000000000) {
        number = number / 1000000000;
        return `${number.toFixed(1).toLocaleString('en-US')}B`
    }
    else if (number > 1000000) {
        number = number / 1000000;
        return `${number.toFixed(1).toLocaleString('en-US')}M`
    }
    else if (number > 1000) {
        number = Math.round(number / 1000);
        return `${number.toFixed(1).toLocaleString('en-US')}K`
    }
}

const deleteLogs = async () => {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    if (new Date().getTimezoneOffset() == - 9 * 60) {
        //console.log("kst");
    }
    else {
        yesterday = new Date();
        yesterday.setHours(yesterday.getHours() + 9); //한국 기준 날짜
	    
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); 
      
        yesterday.setHours(yesterday.getHours() - 9); //
    }
  
    await supabase
        .from('AiKakaotalkOpenChatAttendanceLog')
        .delete()
        .lt('date', yesterday.toISOString());

    await supabase
        .from('AiKakaotalkOpenChatPointLog')
        .delete()
        .lt('date', yesterday.toISOString());
};
 
const getMe = async (nickName) => {
    const { data: member, error } = await supabase
        .from('AiKakaotalkOpenChatMember')
        .select('*')
        .match({'nickName': nickName})
        .single();

    if (error || !member) {
        await supabase
            .from('AiKakaotalkOpenChatMember')
            .insert([
                { nickName: nickName }
            ]);

        const { data: insertedMember } = await supabase
            .from('AiKakaotalkOpenChatMember')
            .select('*')
            .match({'nickName': nickName})
            .single();

        await supabase
            .from('AiKakaotalkOpenChatMember')
            .update([
                { memberId: insertedMember.id }
            ])
            .match({'nickName': nickName});
        
	    const { data: updatedMember, error } = await supabase
            .from('AiKakaotalkOpenChatMember')
            .select('*')
            .match({'nickName': nickName})
            .single();

        return updatedMember;
    }

    return member;
};

const escapeText = (text) => {
    return text;
}

const attendanceCommand = async (kakaotalkOpenChatSetting, me) => {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date().getTimezoneOffset() == - 9 * 60) {
        //console.log("kst");
    }
    else {
        today = new Date();
	    
        today.setHours(today.getHours() + 9); //한국 기준 날짜
        today.setHours(0, 0, 0, 0); 
      
        today.setHours(today.getHours() - 9); //
    }
	
    const { data: attendanceLogs, error: attendanceError } = await supabase
        .from('AiKakaotalkOpenChatAttendanceLog')
        .select('*')
        .eq('memberId', me.memberId)
        .gte('date', today.toISOString())
        .limit(1);

    if (attendanceLogs.length === 0) {
        const { error: logError } = await supabase
            .from('AiKakaotalkOpenChatAttendanceLog')
            .insert([
                { memberId: me.memberId, date: new Date() }
            ]);

        await supabase
            .from('AiKakaotalkOpenChatPointLog')
            .insert([
                { memberId: me.memberId, addPoint: kakaotalkOpenChatSetting.attendanceMessagePoint, currentPoint: me.point + kakaotalkOpenChatSetting.attendanceMessagePoint }
            ]);

        const { error: pointUpdateError } = await supabase
            .from('AiKakaotalkOpenChatMember')
            .update({ attendanceCount: me.attendanceCount + 1, point: me.point + kakaotalkOpenChatSetting.attendanceMessagePoint })
            .eq('memberId', me.memberId);

        //출석 완료! {attendance-message-point} 포인트가 적립되었습니다. 현재 포인트: {current-point} 포인트
        const text = kakaotalkOpenChatSetting.attendanceMessage.replace("{attendance-message-point}", kakaotalkOpenChatSetting.attendanceMessagePoint).replace("{current-point}", me.point + kakaotalkOpenChatSetting.attendanceMessagePoint);
        await deleteLogs();
        return escapeText(text);
    } 
    else {
        return escapeText('이미 출석하셨습니다. 하루에 한 번만 출석 가능합니다.');
    }
};

const myInfoCommand = async (kakaotalkOpenChatSetting, me) => {
    /*
닉네임: {nick-name}
보유 포인트: {point}
출석 일수: {attendance-count} 일
    */
    const text = kakaotalkOpenChatSetting.myInfoMessage
      .replace("{nick-name}", me.nickName)
      .replace("{point}", me.point)
      .replace("{attendance-count}", me.attendanceCount);

    return escapeText(text);
};

const rankingCommand = async (kakaotalkOpenChatSetting, me) => {
    const { data: members, error } = await supabase
        .from('AiKakaotalkOpenChatMember')
        .select('*')
        .order('point', { ascending: false })
        .limit(10);

    /*
포인트 랭킹:

    */
    var text = kakaotalkOpenChatSetting.rankingTitle;
    members.forEach((member, index) => {
        /*
{rank}위 {nick-name} {point} 포인트

        */
        text += kakaotalkOpenChatSetting.rankingLineMessage.replace("{rank}", index + 1).replace("{nick-name}", member.nickName).replace("{point}", member.point);
    });

    return escapeText(text);
};

const aiCommand = async (kakaotalkOpenChatSetting, aiSetting, me, msg) => {
    process.env.OPENAI_API_KEY = aiSetting.openaiApiKey;
    process.env.TAVILY_API_KEY = aiSetting.tavilysearchToolApiKey;

    const text = msg.replace("/질문", "").replace(".질문", "").trim();
    //console.log(text);

    //if (langchainAgentHandler == null) {
      const systemMessage = aiSetting.systemPrompt;
      const prompt = ChatPromptTemplate.fromMessages([
          //["system", systemMessage],
          SystemMessagePromptTemplate.fromTemplate(systemMessage),
          new MessagesPlaceholder("chat_history"),
          //["human", "{input}"],
          HumanMessagePromptTemplate.fromTemplate("{input}"),
          new MessagesPlaceholder("agent_scratchpad"),
      ]);

      const tools = [];
    
      /*
      const tools = [
          //createSupabaseRetrieverTool({
          //    name: "search_hicaddy", 
          //    description: "Searches and returns documents regarding the hicaddy golf club delivery service."
          //}),
          //createCoinPriceTool(), 
          //createWebbrowserTool(), 
          createTavilysearchTool()
      ];

      if (aiSetting.useCoinPriceTool) 
        tools.push(createCoinPriceTool());
      if (aiSetting.useTavilysearchTool) 
        tools.push(createWebbrowserTool());
      if (aiSetting.useWebbrowserTool) 
        tools.push(createTavilysearchTool());
      */
      ///*
      const { data: aiTools } = await supabase
      .from('AiToolFile')
      .select('*')
      .match({ use: true });
      for (const aiTool of aiTools) {
        const toolName = aiTool.name; //'gold-man-check-result-tool';
        const func = require(`../../lib/langchain-agent-tools/${toolName}.js`).default;
        var tool = null;
        try {
          tool = func();
        }
        catch(error) {
          tool = func({});
        }
        tools.push(tool);
      }
      //*/

      const { data: aiChatgptPlugins } = await supabase
      .from('AiChatgptPlugin')
      .select('*')
      .match({ use: true });
      if(aiChatgptPlugins.length > 0) {
        tools.push(new RequestsGetTool());
        tools.push(new RequestsPostTool());
      }
      for (const aiChatgptPlugin of aiChatgptPlugins) {
        const tool = await createChatgptPluginAsyncTool({ url: aiChatgptPlugin.url });
        tool.name = aiChatgptPlugin.name;
        tools.push(tool);
      }

      if (tools.length == 0) 
        tools.push(createDummyTool());
    
      langchainAgentHandler = new LangchainAgentHandler({prompt, tools}); 
    //}

    const messages = [
      { 
        role: 'user', 
        content: text 
      }
    ];
    const responseText = await langchainAgentHandler.handle(messages);
    return responseText;
}

export async function POST(request) {
    const json = await request.json();
    //console.log(json);
    const room = json.room;
    const msg = json.msg;
    const sender = json.sender;
    const isGroupChat = json.isGroupChat;
    const imageDBProfileBase64 = json.imageDBProfileBase64;
    const packageName = json.packageName;

    try {
        const { data: kakaotalkOpenChatSetting } = await supabase
        .from('AiKakaotalkOpenChatSetting')
        .select('*')
        .single();

        if (kakaotalkOpenChatSetting.useBot) {
            //출석
            if (kakaotalkOpenChatSetting.useAttendanceMessage 
                && (msg == "/attendance" || msg == ".attendance" || msg == "/출석" || msg == ".출석")) {
                const me = await getMe(sender);
                const message = await attendanceCommand(kakaotalkOpenChatSetting, me);
                //return new NextResponse(message);
                return NextResponse.json({message: message});
            }
            //내정보
            else if (kakaotalkOpenChatSetting.useMyInfoMessage 
                && (msg == "/myinfo" || msg == ".myinfo" || msg == "/내정보" || msg == ".내정보" || msg == "/나" || msg == ".나")) {          
                const me = await getMe(sender);
                const message = await myInfoCommand(kakaotalkOpenChatSetting, me);
                //return new NextResponse(message);
                return NextResponse.json({message: message});
            }
            //랭킹
            else if (kakaotalkOpenChatSetting.useRanking 
                && (msg == "/ranking" || msg == ".ranking" || msg == "/랭킹" || msg == ".랭킹")) {          
                const me = await getMe(sender);
                const message = await rankingCommand(kakaotalkOpenChatSetting, me);
                //return new NextResponse(message);
                return NextResponse.json({message: message});
            }
            //도움말
            else if (kakaotalkOpenChatSetting.useHelpMessage 
                && (msg.startsWith("/help") || msg.startsWith(".help") || msg.startsWith("/도움말") || msg.startsWith(".도움말"))) {
                const message = kakaotalkOpenChatSetting.helpMessage;
                //return new NextResponse(message);
                return NextResponse.json({message: message});
            }
            //ai
            else if (msg.startsWith("/질문") || msg.startsWith(".질문")) {
                const { data: aiSetting } = await supabase
                .from('AiSetting')
                .select('*')
                .single();
            
                if (aiSetting.useAi) {
                    const me = await getMe(sender);
                    const responseText = await aiCommand(kakaotalkOpenChatSetting, aiSetting, me, msg);
                    if (aiSetting.useMessageLog) {
                        await supabase
                            .from('AiMessageLog')
                            .insert([
                                { message: msg, reply: responseText }
                            ]);
                    }
                    //console.log(responseText);
                    //return new NextResponse(responseText);
                    return NextResponse.json({message: responseText});
                }
            } 
	    /*
            //운세
            else if (msg.startsWith("/운세 ") || msg.startsWith(".운세 ")) {
                //const chineseZodiac = "쥐띠";
                const chineseZodiac = msg.split(" ")[1];

                const { data: commandSetting } = await supabase
                .from('CommandSetting')
                .select('*')
                .single();
                
                if (commandSetting.useCommand) {
                    if (commandSetting.useFortuneCommand) {
                        const { data: apiSetting } = await supabase
                        .from('ApiSetting')
                        .select('*')
                        .single();

                        var apiUrl = apiSetting.apiUrl;
                        if (apiUrl) {
                        }
                        else {
                            apiUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
                            if (apiUrl) {
                                apiUrl = "https://" + apiUrl;
                            }
                            else {
                                apiUrl = "http://localhost:3000";
                            }
                        }

                        const query = `${chineseZodiac} 운세`;
                        const response = await fetch(`${apiUrl}/api/command/fortune?chineseZodiac=${encodeURIComponent(query)}&key=123`);
                        const responseJson = await response.json();
                        //console.log(responseJson);

                        const keys = Object.keys(responseJson);

                        const result = `${chineseZodiac} 운세:
${responseJson.fortune}

${keys[0]}년생: 
${responseJson[keys[0]]}

${keys[1]}년생:
${responseJson[keys[1]]}

${keys[2]}년생:
${responseJson[keys[2]]}

${keys[3]}년생:
${responseJson[keys[3]]}

${keys[4]}년생:
${responseJson[keys[4]]}`

                        return NextResponse.json({message: result});
                    }
                }
            }
            //시총
            else if (msg.startsWith("/시총") || msg.startsWith(".시총")) {
                const { data: commandSetting } = await supabase
                .from('CommandSetting')
                .select('*')
                .single();
                
                if (commandSetting.useCommand) {
                    if (commandSetting.useMarketCapitalizationCommand) {
                        const { data: apiSetting } = await supabase
                        .from('ApiSetting')
                        .select('*')
                        .single();

                        var apiUrl = apiSetting.apiUrl;
                        if (apiUrl) {
                        }
                        else {
                            apiUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
                            if (apiUrl) {
                                apiUrl = "https://" + apiUrl;
                            }
                            else {
                                apiUrl = "http://localhost:3000";
                            }
                        }

                        if (msg.startsWith("/시총 ") || msg.startsWith(".시총 ")) {
                            var symbol = msg
                            .replace("/시총 비트코인", "/시총 btc")
                            .replace("/시총 비트", "/시총 btc")
                            .replace("/시총 bitcoin", "/시총 btc")
                            .replace("/시총 월드코인", "/시총 wld")
                            .replace("/시총 월드", "/시총 wld")
                            .trim()
                            .split(" ")[1];
                            //console.log(symbol);
                            symbol = symbol.trim();

                            const response = await fetch(`${apiUrl}/api/command/market-capitalization?key=123&symbol=${symbol}`);
                            const responseJson = await response.json();
                            //console.log(responseJson);
                            return NextResponse.json({message: `${symbol.toUpperCase()} 시총\n${responseJson.message}`});
                        }
                        else {
                            const response = await fetch(`${apiUrl}/api/command/market-capitalization?key=123`);
                            const responseJson = await response.json();
                            //console.log(responseJson);
                            return NextResponse.json({message: `시총\n${responseJson.message}`});
                        }
                    }
                }
            }
            //기타, 코인
            else if (msg.startsWith("/") || msg.startsWith(".")) {
                const { data: commandSetting } = await supabase
                .from('CommandSetting')
                .select('*')
                .single();

                if (commandSetting.useCommand) {
                    if (commandSetting.useCoinPriceCommand) {
                        const { data: apiSetting } = await supabase
                        .from('ApiSetting')
                        .select('*')
                        .single();

                        var apiUrl = apiSetting.apiUrl;
                        if (apiUrl) {
                        }
                        else {
                            apiUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
                            if (apiUrl) {
                                apiUrl = "https://" + apiUrl;
                            }
                            else {
                                apiUrl = "http://localhost:3000";
                            }
                        }
                        
                        if (commandSetting.useCoinPriceSimpleMessage) {
                            const symbol = msg
                            .replace("/", "")
                            .replace(".", "")
                            .replace("비트코인", "btc")
                            .replace("비트", "btc")
                            .replace("bitcoin", "btc")
                            .replace("월드코인", "wld")
                            .replace("월드", "wld")
                            .trim();
                            //console.log(symbol);

                            if (commandSetting.useCoinPriceCommandCoinbase) {
                                var binanceDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=binance&symbol=${symbol}`);
                                    const binancePrice = await response.text();
                                    binanceDescription = `${Number(binancePrice).toLocaleString('en-US')}`
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var coinbaseDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=coinbase&symbol=${symbol}`);
                                    const coinbasePrice = await response.text();
                                    coinbaseDescription = `${Number(coinbasePrice).toLocaleString('en-US')}`
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var upbitDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=upbit&symbol=${symbol}`);
                                    const upbitPrice = await response.text();
                                    upbitDescription = `${Number(upbitPrice).toLocaleString('ko-KR')}`;
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var bithumbDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=bithumb&symbol=${symbol}`);
                                    const bithumbPrice = await response.text();
                                    bithumbDescription = `${Number(bithumbPrice).toLocaleString('ko-KR')}`
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                        
                                const responseText = `${symbol.toUpperCase()}
                                
                        Binance ($)
                        ${binanceDescription} $
                        
                        Coinbase ($)
                        ${coinbaseDescription} $
                        
                        Upbit (₩)
                        ${upbitDescription} ₩
                        
                        Bithumb (₩)
                        ${bithumbDescription} ₩`;
                                return NextResponse.json({message: responseText});
                            }
                            else {
                                var binanceDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=binance&symbol=${symbol}`);
                                    const binancePrice = await response.text();
                                    binanceDescription = `${Number(binancePrice).toLocaleString('en-US')}`
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var upbitDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=upbit&symbol=${symbol}`);
                                    const upbitPrice = await response.text();
                                    upbitDescription = `${Number(upbitPrice).toLocaleString('ko-KR')}`
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var bithumbDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=price&key=123&exchange=bithumb&symbol=${symbol}`);
                                    const bithumbPrice = await response.text();
                                    bithumbDescription = `${Number(bithumbPrice).toLocaleString('ko-KR')}`
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                        
                                const responseText = `${symbol.toUpperCase()}
                                
                        Binance ($)
                        ${binanceDescription} $
                        
                        Upbit (₩)
                        ${upbitDescription} ₩
                        
                        Bithumb (₩)
                        ${bithumbDescription} ₩`;
                                return NextResponse.json({message: responseText});
                            }

                        }
                        else if (commandSetting.useCoinPriceOhlcvMessage) {
                            const symbol = msg
                            .replace("/", "")
                            .replace(".", "")
                            .replace("비트코인", "btc")
                            .replace("비트", "btc")
                            .replace("bitcoin", "btc")
                            .replace("월드코인", "wld")
                            .replace("월드", "wld")
                            .trim();
                            //console.log(symbol);

                            var gimpDescription = "";
                            try {
                                const response = await fetch(`${apiUrl}/api/command/coin-price?command=gimp&key=123`);
                                const gimp = await response.json();
                                //console.log(gimp); //{ gimpPercent: '3.27' }
                                gimpDescription = `${gimp.gimpPercent}%`;
                            }
                            catch(error) {
                                gimpDescription = error.message;
                            }
                    
                            //
                            
                            const { data: commandSetting } = await supabase
                            .from('CommandSetting')
                            .select('*')
                            .single();
                    
                            if (commandSetting.useCoinPriceCommandCoinbase) {
                                var binanceOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=binance&symbol=${symbol}`);
                                    const binanceOhlcv = await response.json();
                                    if (binanceOhlcv) {
                                        binanceOhlcvDescription = `H : ${binanceOhlcv.high} (${binanceOhlcv.highPerOpenPercent}%)
                    C : ${binanceOhlcv.close} (${binanceOhlcv.closePerOpenPercent}%)
                    L : ${binanceOhlcv.low} (${binanceOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var coinbaseOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=coinbase&symbol=${symbol}`);
                                    const coinbaseOhlcv = await response.json();
                                    if (coinbaseOhlcv) {
                                        coinbaseOhlcvDescription = `H : ${coinbaseOhlcv.high} (${coinbaseOhlcv.highPerOpenPercent}%)
                    C : ${coinbaseOhlcv.close} (${coinbaseOhlcv.closePerOpenPercent}%)
                    L : ${coinbaseOhlcv.low} (${coinbaseOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var upbitOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=upbit&symbol=${symbol}`);
                                    const upbitOhlcv = await response.json();
                                    if (upbitOhlcv) {
                                        upbitOhlcvDescription = `H : ${upbitOhlcv.high} (${upbitOhlcv.highPerOpenPercent}%)
                    C : ${upbitOhlcv.close} (${upbitOhlcv.closePerOpenPercent}%)
                    L : ${upbitOhlcv.low} (${upbitOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var bithumbOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=bithumb&symbol=${symbol}`);
                                    const bithumbOhlcv = await response.json();
                                    if (bithumbOhlcv) {
                                        bithumbOhlcvDescription = `H : ${bithumbOhlcv.high} (${bithumbOhlcv.highPerOpenPercent}%)
                    C : ${bithumbOhlcv.close} (${bithumbOhlcv.closePerOpenPercent}%)
                    L : ${bithumbOhlcv.low} (${bithumbOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                
                                const message = `${symbol.toUpperCase()} (김프: ${gimpDescription})
                    
                    Binance ($)
                    ${binanceOhlcvDescription}
                    
                    Coinbase ($)
                    ${coinbaseOhlcvDescription}
                    
                    Upbit (₩)
                    ${upbitOhlcvDescription}
                    
                    Bithumb (₩)
                    ${bithumbOhlcvDescription}`
                                return NextResponse.json({message: message});
                            }
                            else {
                                var binanceOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=binance&symbol=${symbol}`);
                                    const binanceOhlcv = await response.json();
                                    if (binanceOhlcv) {
                                        binanceOhlcvDescription = `H : ${binanceOhlcv.high} (${binanceOhlcv.highPerOpenPercent}%)
                    C : ${binanceOhlcv.close} (${binanceOhlcv.closePerOpenPercent}%)
                    L : ${binanceOhlcv.low} (${binanceOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var upbitOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=upbit&symbol=${symbol}`);
                                    const upbitOhlcv = await response.json();
                                    if (upbitOhlcv) {
                                        upbitOhlcvDescription = `H : ${upbitOhlcv.high} (${upbitOhlcv.highPerOpenPercent}%)
                    C : ${upbitOhlcv.close} (${upbitOhlcv.closePerOpenPercent}%)
                    L : ${upbitOhlcv.low} (${upbitOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                var bithumbOhlcvDescription = "Unlisted";
                                try {
                                    const response = await fetch(`${apiUrl}/api/command/coin-price?command=ohlcv&key=123&exchange=bithumb&symbol=${symbol}`);
                                    const bithumbOhlcv = await response.json();
                                    if (bithumbOhlcv) {
                                        bithumbOhlcvDescription = `H : ${bithumbOhlcv.high} (${bithumbOhlcv.highPerOpenPercent}%)
                    C : ${bithumbOhlcv.close} (${bithumbOhlcv.closePerOpenPercent}%)
                    L : ${bithumbOhlcv.low} (${bithumbOhlcv.lowPerOpenPercent}%)`
                                    }
                                }
                                catch(error) {
                                    console.log(error.message);
                                }
                                
                                const message = `${symbol.toUpperCase()} (김프: ${gimpDescription})
                    
                    Binance ($)
                    ${binanceOhlcvDescription}
                    
                    Upbit (₩)
                    ${upbitOhlcvDescription}
                    
                    Bithumb (₩)
                    ${bithumbOhlcvDescription}`
                                return NextResponse.json({message: message});
                            }
                        }
                    }
                }
            }
	    */
            //else {
            //    const responseText = "이해할 수 없습니다.";
            //    return new NextResponse(responseText);
            //}
        }
    }
    catch(error) {
        //return new NextResponse(error.message);
        return NextResponse.json({message: error.message});
    }
}

//export const runtime = "nodejs" //디폴트
export const runtime = "edge"

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;
