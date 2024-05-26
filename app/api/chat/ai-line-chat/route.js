import { NextRequest, NextResponse } from "next/server";
import { Client } from '@line/bot-sdk';
import { createClient } from '@supabase/supabase-js'
//const dotenv = require('dotenv');

//dotenv.config();

import { OpenAIStream, StreamingTextResponse } from 'ai';
import LangchainAgentHandler from "../../lib/langchain-agent-handler.js";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { createRetrieverTool } from "langchain/agents/toolkits";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { loadQAStuffChain, loadQAMapReduceChain } from "langchain/chains";
import { SystemMessage, AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "langchain/prompts";
//import createSupabaseRetrieverTool from "../../lib/langchain-agent-tools/supabase-retriever-tool.js"
//import createCoinPriceTool from "../../lib/langchain-agent-tools/coin-price-tool.js"
//import createWebbrowserTool from "../../lib/langchain-agent-tools/webbrowser-tool.js"
//import createTavilysearchTool from "../../lib/langchain-agent-tools/tavilysearch-tool.js"
import createDummyTool from "../../lib/langchain-agent-tools/dummy-tool.js"
import { RequestsGetTool, RequestsPostTool } from "langchain/tools";
import createChatgptPluginAsyncTool from "../../lib/langchain-agent-tools/chatgpt-plugin-async-tool.js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

var langchainAgentHandler = null;

const talkToAi = async (text, aiSetting) => {
    //const json = await request.json();
    //console.log(json);
    //const messages = json.messages;

    try {
      process.env.OPENAI_API_KEY = aiSetting.openaiApiKey;
      process.env.TAVILY_API_KEY = aiSetting.tavilysearchToolApiKey;

      //if (langchainAgentHandler == null) {
        const systemMessagePrompt = aiSetting.systemPrompt;
        const prompt = ChatPromptTemplate.fromMessages([
          ["system", systemMessagePrompt],
          new MessagesPlaceholder("chat_history"),
          ["human", "{input}"],
          new MessagesPlaceholder("agent_scratchpad"),
        ]);
        
        const tools = [];

        /*
        if (aiSetting.useCoinPriceTool) 
          tools.push(createCoinPriceTool());
        if (aiSetting.useTavilysearchTool) 
          tools.push(createWebbrowserTool());
        if (aiSetting.useWebbrowserTool) 
          tools.push(createTavilysearchTool());

        const tool = createSupabaseRetrieverTool({
            name: 'search_documents_about_user_question', 
            description: 'Searches and returns documents if has no information about user question.',
            tableName: 'documents',
            queryName: 'match_documents'
        });
        tools.push(tool);
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
        
        langchainAgentHandler = new LangchainAgentHandler({prompt, modelName: aiSetting.openaiModelName, tools}); 
      //}

      const messages = [
        { 
          role: 'user', 
          content: text 
        }
      ];
      const responseText = await langchainAgentHandler.handle(messages);
      //console.log(responseText);
      return responseText;
    }
    catch(error) {
        return error.message;
    }
}

// LINE 챗봇 설정
/*
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
*/
const config = {
  channelAccessToken: 'bZ5Wqe5IuNp3QREhrRhmNrmmL3bB1HrWQmBxgEFMYtB1VVCmwfmYrGLbRTevJFBg1ZytFI1Lqx9fhN4MzRbC9/t/R8v+QobXXSZgmqPwwJ+qKTJJ1bfp71me8FJ8Cm/gr5mgahxM7S6tKCRBWF+/DAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '80702a6a2d63e912129e79dac5935532'
};

const client = new Client(config);

const chatbotHome = () => {
  const text = `챗봇 및 챗지피티 플러그인을 제작해 드립니다.\n\
\“초기 버전 무료 제작\”\n\
도움말을 다시 보시려면 \"/도움말\" 메세지를 보내주세요.`;    
  return {
    type: 'template',
    altText: '제작 문의',
    template: {
      type: 'buttons',
      //thumbnailImageUrl: 'https://example.com/inquiry.jpg',
      title: '제작 문의',
      text: text,
      actions: [
        {
          type: 'postback',
          label: '챗봇 제작',
          data: 'create-chatbot'
        },
        {
          type: 'postback',
          label: '챗지피티 플러그인 제작',
          data: 'create-chatgpt-plugin'
        },
        {
          type: 'postback',
          label: '제작 문의',
          data: 'inquiry'
        }
      ]
    }
  };
};

const createHelpMessage = (event) => {
  const text = `챗봇 및 챗지피티 플러그인을 제작해 드립니다.\n\
\“초기 버전 무료 제작\”\n\
도움말을 다시 보시려면 \"/도움말\" 메세지를 보내주세요.`;    
  return {
    type: 'template',
    altText: '도움말 및 메뉴',
    template: {
      type: 'buttons',
      thumbnailImageUrl: 'images/create-chatbot-chatgpt-plugin.png',
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
      imageBackgroundColor: '#FFFFFF',
      title: '도움말 및 메뉴',
      text: text,
      actions: [
        {
          type: 'postback',
          label: '챗봇 제작',
          data: 'create-chatbot'
        },
        {
          type: 'postback',
          label: '챗지피티 플러그인 제작',
          data: 'create-chatgpt-plugin'
        },
        {
          type: 'postback',
          label: '제작 문의',
          data: 'inquiry'
        }
      ]
    }
  };
};

const createChatbotMessage = () => {
  const text = `
카카오톡\n\
텔레그램\n\
디스코드\n\
유튜브\n\
슬랙\n\
챗봇\n\
카카오톡 스킬\n\
카카오톡 콜백\n\
커스텀 챗지피티 챗봇\n\
메시지 포워드\n\
알림\n\
관리자 페이지\n\
IoT 제어\n\
웹 버전\n\
모바일 버전\n\
데스크탑 버전\n\
크롬 확장
  `  
  return {
    type: 'template',
    altText: '챗봇 제작 서비스',
    template: {
      type: 'buttons',
      thumbnailImageUrl: 'images/create-chatbot.png',
      title: '챗봇 제작 서비스',
      text: text,
      actions: [
        {
          type: 'uri',
          label: '자세히 보기',
          uri: 'https://www.automatethem.co/create-program/create-chatbot'
        },
        {
          type: 'uri',
          label: '포트 폴리오',
          data: 'https://www.automatethem.co/create-chatbot/portfolio'
        },
        {
          type: 'postback',
          label: '챗봇 홈',
          data: 'chatbotHome'
        }        
      ]
    }
  };
};

const createChatGPTPluginMessage = () => {
  const text = `
챗지피티 플러그인 제작
  `  
  return {
    type: 'template',
    altText: '챗지피티 플러그인 제작',
    template: {
      type: 'buttons',
      thumbnailImageUrl: 'images/create-chatgpt-plugin.png',
      title: '챗지피티 플러그인 제작',
      text: text,
      actions: [
        {
          type: 'uri',
          label: '자세히 보기',
          uri: 'https://www.automatethem.co/create-program/create-chatgpt-plugin'
        },
        {
          type: 'uri',
          label: '포트 폴리오',
          data: 'https://www.automatethem.co/create-chatbot/portfolio'
        },
        {
          type: 'postback',
          label: '챗봇 홈',
          data: 'chatbotHome'
        }    
      ]
    }
  };
};

const createInquiryMessage = () => {
  const text = `
*제작 절차*\n\
\n\
[초기 버전]\n\
: 무료, 1 ~ 7일, 기본 기능\n\
-제작 문의\n\
-프로그램 기능 상담\n\
-초기 버전 무료 제작\n\
-초기 버전 전달\n\
-믿음이 생길 때 까지 프로그램 수정\n\
\n\
[정식 버전].\n\
: 5만원 ~, 1 ~ 20일, 세부 기능\n\
-선금 50% 입금\n\
-정식 버전 제작\n\
-정식 버전 전달\n\
-만족하실 때 까지 프로그램 수정\n\
-잔금 50% 입금\n\
-최종 버전 전달\n\
\n\
[입금 계좌 번호]\n\
농협 301-0312-4534-11 권상기 크랜베리\n\
\n\
*제작 문의*\n\
\n\
전화 문의\n\
[01057781756](tel:01057781756)
  `  
  return {
    type: 'template',
    altText: '제작 문의',
    template: {
      type: 'buttons',
      //thumbnailImageUrl: 'https://example.com/inquiry.jpg',
      title: '제작 문의',
      text: text,
      actions: [
        {
          type: 'uri',
          label: '전화 문의',
          uri: 'tel:010-1234-5678'
        },        
        {
          type: 'uri',
          label: '자세히 보기',
          uri: 'https://www.automatethem.co/inquiry'
        },
        {
          type: 'postback',
          label: '챗봇 홈',
          data: 'chatbotHomr'
        }
      ]
    }
  };
};

export async function POST(request) {
  const json = await request.json();
  const events = json.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      let response;

      switch (event.message.text) {
        case '/시작':
        case '/도움말':
          response = createHelpMessage(event);
          break;
        case 'create-chatbot':
          response = createChatbotMessage();
          break;
        case 'create-chatgpt-plugin':
          response = createChatGPTPluginMessage();
          break;
        case 'inquiry':
          response = createInquiryMessage();
          break;
        default: {
          //response = { type: 'text', text: '알 수 없는 명령입니다.' };

          const { data: aiSetting } = await supabase
          .from('AiSetting')
          .select('*')
          .single();

          if (aiSetting.useAi) {
              const text = event.message.text;
              const replyText = await talkToAi(text, aiSetting);
              response = { type: 'text', text: replyText };
          }
        }
      }

      await client.replyMessage(event.replyToken, response);
    } 
    else if (event.type === 'postback') {
      let response;

      switch (event.postback.data) {
        case 'create-chatbot':
          response = createChatbotMessage();
          break;
        case 'chatbotHome':
          response = chatbotHome();
          break;          
        case 'create-chatgpt-plugin':
          response = createChatGPTPluginMessage();
          break;
        case 'inquiry':
          response = createInquiryMessage();
          break;
        default: {
          response = { type: 'text', text: '알 수 없는 명령입니다.' };
        }
      }

      await client.replyMessage(event.replyToken, response);
    }
  }

  return NextResponse.json({ success: true });
}

export const runtime = 'nodejs' //디폴트
//export const runtime = 'edge' //에러

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;
