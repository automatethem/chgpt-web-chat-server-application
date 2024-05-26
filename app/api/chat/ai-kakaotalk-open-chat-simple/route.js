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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

var langchainAgentHandler = null;

const escapeText = (text) => {
    return text;
}

const aiCommand = async (kakaotalkOpenChatSetting, aiSetting, msg) => {
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
            if (msg.startsWith("/질문") || msg.startsWith(".질문")) {
                const { data: aiSetting } = await supabase
                .from('AiSetting')
                .select('*')
                .single();
            
                if (aiSetting.useAi) {
                    const responseText = await aiCommand(kakaotalkOpenChatSetting, aiSetting, msg);
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
