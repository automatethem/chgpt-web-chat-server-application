import { NextRequest, NextResponse } from "next/server";
const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
import { createClient } from '@supabase/supabase-js'
 
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

const { data: telegramWebhookChatSetting } = await supabase
.from('AiTelegramWebhookChatSetting')
.select('*')
.single();

process.env.BOT_TOKEN = telegramWebhookChatSetting.botToken;

const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);

const escapeText = (text) => {
    return text;
}

const startCommand = async (ctx) => {
    const { data: welcomeMessageButtons, error: buttonsError } = await supabase
        .from('AiTelegramWebhookChatWelcomeMessageButton')
        .select('*')
        .order('priority');

    const text = telegramWebhookChatSetting.welcomeMessage.replace("{nick-name}", ctx.from.first_name);
    const inlineKeyboardButtons = welcomeMessageButtons.map(button => {
        return [Markup.button.url(button.name, button.url)];
    });
    //console.log(inlineKeyboardButtons);

    if (telegramWebhookChatSetting.useWelcomeMessageImage && telegramWebhookChatSetting.welcomeMessageImageUrl != "") {
        //console.log(Markup.inlineKeyboard(inlineKeyboardButtons)); //Markup { reply_markup: { inline_keyboard: [ [Array] ] } }
        await ctx.replyWithPhoto({ url: telegramWebhookChatSetting.welcomeMessageImageUrl }, { caption: escapeText(text), parse_mode: 'Markdown', ...Markup.inlineKeyboard(inlineKeyboardButtons) });
    }
    else {
        await ctx.replyWithMarkdown(escapeText(text), { parse_mode: 'Markdown', ...Markup.inlineKeyboard(inlineKeyboardButtons) });
    }
};

const helpCommand = async (ctx) => {
    const text = telegramWebhookChatSetting.helpMessage;
    await ctx.replyWithMarkdown(escapeText(text), { parse_mode: 'Markdown' });
};

///start
bot.start(async (ctx) => { 
    try {
        const id = ctx.from.id;
        const chatId = ctx.chat.id;
        //console.log(chatId);

        const { data: telegramWebhookChatSetting } = await supabase
        .from('AiTelegramWebhookChatSetting')
        .select('*')
        .single();

        /*
        if (chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) {
            if (telegramWebhookChatSetting.useWelcomeMessage) {
                await startCommand(ctx); 
            }
        }
        */
        if (ctx.message.chat.type == "private") {
            if (telegramWebhookChatSetting.usePrivateChat) {
                //https://stackoverflow.com/questions/72640703/telegram-how-to-find-group-chat-id
                //크랜베리 (id == chatId)
                //console.log(id); //5015649778
                if (telegramWebhookChatSetting.useWelcomeMessage) {
                    await startCommand(ctx); 
                }
            }
        }
        //else if (ctx.message.chat.type == "group") {
        //    //연습용 그룹
        //    //console.log(chatId); //-4149881111
        //}
        //else if (ctx.message.chat.type == "supergroup") {
        //    //크랜 베리 그룹
        //    //console.log(chatId); //-1001745886007
        //    //연습용 수퍼 그룹
        //    //console.log(chatId); //-1001630821111
        //}
        //else if (ctx.message.chat.type == "group" || ctx.message.chat.type == "supergroup") {
        //}
        else {
            if (telegramWebhookChatSetting.useGroupChat) {
                if (telegramWebhookChatSetting.useChatId) {
                    if (chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) {
                        if (telegramWebhookChatSetting.useWelcomeMessage) {
                            await startCommand(ctx); 
                        }
                    }
                }
                else {
                    if (telegramWebhookChatSetting.useWelcomeMessage) {
                        await startCommand(ctx); 
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
});

///help
bot.help(async (ctx) => { 
    try {
        const id = ctx.from.id;
        const chatId = ctx.chat.id;
        //console.log(chatId);

        const { data: telegramWebhookChatSetting } = await supabase
        .from('AiTelegramWebhookChatSetting')
        .select('*')
        .single();

        /*
        if (chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) {
            if (telegramWebhookChatSetting.useHelpMessage) {
                await helpCommand(ctx); 
            }
        }
        */
        if (ctx.message.chat.type == "private") {
            if (telegramWebhookChatSetting.usePrivateChat) {
                //https://stackoverflow.com/questions/72640703/telegram-how-to-find-group-chat-id
                //크랜베리 (id == chatId)
                //console.log(id); //5015649778
                if (telegramWebhookChatSetting.useHelpMessage) {
                    await helpCommand(ctx); 
                }
            }
        }
        //else if (ctx.message.chat.type == "group") {
        //    //연습용 그룹
        //    //console.log(chatId); //-4149881111
        //}
        //else if (ctx.message.chat.type == "supergroup") {
        //    //크랜 베리 그룹
        //    //console.log(chatId); //-1001745886007
        //    //연습용 수퍼 그룹
        //    //console.log(chatId); //-1001630821111
        //}
        //else if (ctx.message.chat.type == "group" || ctx.message.chat.type == "supergroup") {
        //}
        else {
            if (telegramWebhookChatSetting.useGroupChat) {
               if (telegramWebhookChatSetting.useChatId) {
                   if (chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) {
                       if (telegramWebhookChatSetting.useHelpMessage) {
                           await helpCommand(ctx); 
                       }
                   }
               }
               else {
                   if (telegramWebhookChatSetting.useHelpMessage) {
                       await helpCommand(ctx); 
                   }
               }
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
});

bot.on("chat_member", async (ctx) => { 
    try {
        const id = ctx.from.id;
        const chatId = ctx.chat.id;
        //console.log(chatId);

        const { data: telegramWebhookChatSetting } = await supabase
        .from('AiTelegramWebhookChatSetting')
        .select('*')
        .single();

        /*
        if (chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) {
            const status = ctx.chatMember.new_chat_member.status;
            if (status == "member") {//member or left
                if (telegramWebhookChatSetting.useWelcomeMessage) {
                    await startCommand(ctx);
                }
            }
        }
        */
        if (ctx.message.chat.type == "private") {
            if (telegramWebhookChatSetting.usePrivateChat) {
                //https://stackoverflow.com/questions/72640703/telegram-how-to-find-group-chat-id
                //크랜베리 (id == chatId)
                //console.log(id); //5015649778
                const status = ctx.chatMember.new_chat_member.status;
                if (status == "member") {//member or left
                    if (telegramWebhookChatSetting.useWelcomeMessage) {
                        await startCommand(ctx);
                    }
                }
            }
        }
        //else if (ctx.message.chat.type == "group") {
        //    //연습용 그룹
        //    //console.log(chatId); //-4149881111
        //}
        //else if (ctx.message.chat.type == "supergroup") {
        //    //크랜 베리 그룹
        //    //console.log(chatId); //-1001745886007
        //    //연습용 수퍼 그룹
        //    //console.log(chatId); //-1001630821111
        //}
        //else if (ctx.message.chat.type == "group" || ctx.message.chat.type == "supergroup") {
        //}
        else {
            if (telegramWebhookChatSetting.useGroupChat) {
                if (telegramWebhookChatSetting.useChatId) {
                    if (chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) {
                        const status = ctx.chatMember.new_chat_member.status;
                        if (status == "member") {//member or left
                            if (telegramWebhookChatSetting.useWelcomeMessage) {
                                await startCommand(ctx);
                            }
                        }
                    }
                }
                else {
                    const status = ctx.chatMember.new_chat_member.status;
                    if (status == "member") {//member or left
                        if (telegramWebhookChatSetting.useWelcomeMessage) {
                            await startCommand(ctx);
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
});

bot.on('message', async (ctx) => {
    try {
        const id = ctx.from.id;
        const chatId = ctx.chat.id;
        const isBot = ctx.from.is_bot;

        const { data: telegramWebhookChatSetting } = await supabase
        .from('AiTelegramWebhookChatSetting')
        .select('*')
        .single();

        /*
        if ((chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) && !isBot) {   
            const text = ctx.message.text;
            //console.log(text);
            if (text == "/시작") {
                if (telegramWebhookChatSetting.useWelcomeMessage) {
                    await startCommand(ctx);
                }
            }
            else if (text == "/도움말") {
                if (telegramWebhookChatSetting.useHelpMessage) {
                    await helpCommand(ctx);
                }
            }
            else {
                const { data: aiSetting } = await supabase
                .from('AiSetting')
                .select('*')
                .single();

                if (aiSetting.useAi) {
                    const replyText = await talkToAi(text, aiSetting);
                    await ctx.replyWithMarkdown(escapeText(replyText), { parse_mode: 'Markdown' });
                }
            }
        }
        */
        if (ctx.message.chat.type == "private") {
            if (telegramWebhookChatSetting.usePrivateChat) {
                //https://stackoverflow.com/questions/72640703/telegram-how-to-find-group-chat-id
                //크랜베리 (id == chatId)
                //console.log(id); //5015649778
                const text = ctx.message.text;
                //console.log(text);
                if (text == "/시작") {
                    if (telegramWebhookChatSetting.useWelcomeMessage) {
                        await startCommand(ctx);
                    }
                }
                else if (text == "/도움말") {
                    if (telegramWebhookChatSetting.useHelpMessage) {
                        await helpCommand(ctx);
                    }
                }
                else {
                    const { data: aiSetting } = await supabase
                    .from('AiSetting')
                    .select('*')
                    .single();
    
                    if (aiSetting.useAi) {
                        const replyText = await talkToAi(text, aiSetting);
                        await ctx.replyWithMarkdown(escapeText(replyText), { parse_mode: 'Markdown' });
                    }
                }
            }
        }
        //else if (ctx.message.chat.type == "group") {
        //    //연습용 그룹
        //    //console.log(chatId); //-4149881111
        //}
        //else if (ctx.message.chat.type == "supergroup") {
        //    //크랜 베리 그룹
        //    //console.log(chatId); //-1001745886007
        //    //연습용 수퍼 그룹
        //    //console.log(chatId); //-1001630821111
        //}
        //else if (ctx.message.chat.type == "group" || ctx.message.chat.type == "supergroup") {
        //}
        else {
            if (telegramWebhookChatSetting.useGroupChat) {
                if (telegramWebhookChatSetting.useChatId) {
                    if ((chatId == telegramWebhookChatSetting.chatId || chatId == telegramWebhookChatSetting.chatId - 1000000000000 || chatId == telegramWebhookChatSetting.chatId + 1000000000000) && !isBot) {   
                        const text = ctx.message.text;
                        //console.log(text);
                        if (text == "/시작") {
                            if (telegramWebhookChatSetting.useWelcomeMessage) {
                                await startCommand(ctx);
                            }
                        }
                        else if (text == "/도움말") {
                            if (telegramWebhookChatSetting.useHelpMessage) {
                                await helpCommand(ctx);
                            }
                        }
                        else if (text.startsWith("/질문 ") || text.startsWith(".질문 ")) {
                            const { data: aiSetting } = await supabase
                            .from('AiSetting')
                            .select('*')
                            .single();
            
                            if (aiSetting.useAi) {
                                const replyText = await talkToAi(text.replace('/질문 ', '').replace('.질문 ', ''), aiSetting);
                                await ctx.replyWithMarkdown(escapeText(replyText), { parse_mode: 'Markdown' });
                            }
                        }
                    }
                }
                else {
                    const text = ctx.message.text;
                    //console.log(text);
                    if (text == "/시작") {
                        if (telegramWebhookChatSetting.useWelcomeMessage) {
                            await startCommand(ctx);
                        }
                    }
                    else if (text == "/도움말") {
                        if (telegramWebhookChatSetting.useHelpMessage) {
                            await helpCommand(ctx);
                        }
                    }
                    else if (text.startsWith("/질문 ") || text.startsWith(".질문 ")) {
                        const { data: aiSetting } = await supabase
                        .from('AiSetting')
                        .select('*')
                        .single();
        
                        if (aiSetting.useAi) {
                            const replyText = await talkToAi(text.replace('/질문 ', '').replace('.질문 ', ''), aiSetting);
                            await ctx.replyWithMarkdown(escapeText(replyText), { parse_mode: 'Markdown' });
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
});

export async function GET(request) {
    const params = request.nextUrl.searchParams;
    console.log(params);
    //const setWebhook = params.setWebhook;
    const setWebhook = params.get("setWebhook");
    console.log(setWebhook); //true

    //if (params.hasOwnProperty('getWebhookInfo')) {
    if (params.has('getWebhookInfo')) {
        const getWebhookInfo = await bot.telegram.getWebhookInfo();
        return NextResponse.json(getWebhookInfo);
    }
    else if (setWebhook === "true") {
        const { data: apiSetting , error: apiSettingError } = await supabase
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
        
        const webhookUrl = `${apiUrl}/api/chat/ai-telegram-webhook-chat`;
        const isSet = await bot.telegram.setWebhook(webhookUrl, {
            allowedUpdates: [
                "message",
                "edited_message",
                "channel_post",
                "edited_channel_post",
                "inline_query",
                "chosen_inline_result",
                "callback_query",
                "shipping_query",
                "pre_checkout_query",
                "poll",
                "poll_answer",
                "my_chat_member",
                "chat_member",
                "chat_join_request"
            ]
        });
        //console.log(isSet);
        const response = new NextResponse(isSet, {
            headers: {
              'Content-Type': 'text/plain',
            }
        });
        return response;
    }
    else if (setWebhook === "false") {
        const isDeleted = await bot.telegram.deleteWebhook();
        //console.log(isDeleted);
        const response = new NextResponse(isDeleted, {
            headers: {
              'Content-Type': 'text/plain',
            }
        });
        return response;
    }
    else {
        const response = new NextResponse("Unknow command", {
            headers: {
              'Content-Type': 'text/plain',
            }
        });
        return response;
    }
}

export async function POST(request) {
    const json = await request.json();
    //console.log(json);
    //const text = json["userRequest"]["utterance"];
  
    await bot.handleUpdate(json);

    const response = new NextResponse("OK", {
        headers: {
          'Content-Type': 'text/plain',
        }
    });
    return response;
}

//export const runtime = 'nodejs' //디폴트 
//export const runtime = 'edge'

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;
