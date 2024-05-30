/*
process.env.OPENAI_API_KEY
*/
import { OpenAIEmbeddings } from "@langchain/openai";
import { createRetrieverTool } from "langchain/agents/toolkits";
import { createConversationalRetrievalAgent } from "langchain/agents/toolkits";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { OpenAI } from "langchain/llms/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { SystemMessage, AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import createDummyTool from "./langchain-agent-tools/dummy-tool.js"
import { pull } from "langchain/hub";
import { RequestsGetTool, RequestsPostTool } from "langchain/tools";
import createChatgptPluginAsyncTool from "./langchain-agent-tools/chatgpt-plugin-async-tool.js"
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

const convertVercelMessageToLangChainMessage = (message) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } 
  else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } 
  else {
    return new ChatMessage(message.content, message.role);
  }
};
 
/*
const formatMessage = (message) => {
  return `${message.role}: ${message.content}`;
};
*/

//const outputParser = new HttpResponseOutputParser();

class LangchainAgentHandler {
  constructor() {     
   this.agentExecutor = null;
  }

  async init() {
      const { data: aiSetting } = await supabase
      .from('AiSetting')
      .select('*')
      .single();

      process.env.OPENAI_API_KEY = aiSetting.openaiApiKey;
      process.env.TAVILY_API_KEY = aiSetting.tavilysearchToolApiKey;
      
      console.log(process.env.OPENAI_API_KEY);

      const systemMessagePrompt = aiSetting.systemPrompt;
      const prompt = ChatPromptTemplate.fromMessages([
         ["system", systemMessagePrompt],
         new MessagesPlaceholder("chat_history"),
         ["human", "{input}"],
         new MessagesPlaceholder("agent_scratchpad"),
      ]);
      //const prompt = await pull(promptRepositoryName);
      
      const tools = [];

      const { data: aiToolTexts } = await supabase
      .from('AiToolText')
      .select('*')
      .match({ use: true });

      for (const aiToolText of aiToolTexts) {
         ///*
         const schema = {};
         const fields = JSON.parse(aiToolText.schema);
         for (const field of fields) {
            //console.log(field);
            if (field.type == "string")
               schema[field.name] = z.string().describe(field.description)
            else if (field.type == "number")
               schema[field.name] = z.number().describe(field.description)
            //console.log(field.required);
            if (!field.required)
               schema[field.name] = schema[field.name].optional()
            if (field.default != null) {
               console.log('not null');
               schema[field.name] = schema[field.name].default(field.default)
            }
         }
         //*/
         /*
         const schema = {
            "way": z.string().describe('편도 혹은 왕복'),
            "name": z.string().describe('성명'),
            "phone": z.string().describe('전화번호')
         };
         */
         
         const tool = new DynamicStructuredTool({
            name: aiToolText.name,
            //description: "수도권과 지역(부산/제주/호남)간 편도 혹은 왕복 배송신청합니다,", //aiToolText.description,
            description: aiToolText.description,
            schema: z.object(schema),
            func: async (params) => {
               //console.log(params);
               if (aiToolText.useText) {
               return aiToolText.text.toString();
               }
               else {
               const { data: apiSetting } = await supabase
               .from('ApiSetting')
               .select('*')
               .single();

               //const url = "https://www.automatethem.co" + "/api/action/" + aiToolText.name.replace("-tool", "") + "?key=123&" + q;
               //const url = apiSetting.apiUrl + "/api/action/" + aiToolText.name.replace("-tool", "") + "?key=123&" + q;
               //var url = "https://www.automatethem.co/api/action/shop-search?key=123&query={query}&size={size}&minPrice={minPrice}&maxPrice={maxPrice}"
               var url = aiToolText.api;
               //console.log(Object.entries(params)); //[ [ 'query', '휴대폰' ] ]
               for (const [key, value] of Object.entries(params)) {
                  url = url.replace("{" + key + "}", encodeURIComponent(value))
               }
               //https://cocococo.tistory.com/entry/JavaScript-%EC%A0%95%EA%B7%9C%ED%91%9C%ED%98%84%EC%8B%9D%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%9C-repalce-replaceAll-%EC%B9%98%ED%99%98-%EB%B0%A9%EB%B2%95
               //https://velog.io/@commitnpush/Greedy-Lazy
               url = url.replaceAll(/{.*?}/g, "");
               console.log(url);
               const response = await fetch(url);
               //console.log(response);
               //const responseJson = await response.json(); 
               const responseText = await response.text(); 

               return responseText;
               }
            },
         });
         tools.push(tool);
      }

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
         const func = require(`./langchain-agent-tools/${toolName}.js`).default;
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
         
      const model = new ChatOpenAI({
         model_name: aiSetting.openaiModelName,
         openAIApiKey: process.env.OPENAI_API_KEY,
         temperature: 0,
      });
      
      const agent = await createOpenAIToolsAgent({
         prompt: prompt,
         llm: model,
         tools: tools,
      });
      
      this.agentExecutor = new AgentExecutor({
         agent,
         tools: tools,
         //verbose: true,
         handleParsingErrors: 'Please try again.'
      });
  }

  async handle(messages) {
    //const historyStr = messages.slice(0, -1).map(formatMessage).join("\n");
    //console.log(historyStr);
    /*
system: 당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다.
    */
    /*
system: 당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다.
user: 반갑습니다
assistant: 안녕하세요! 반갑습니다. 궁금한 점이 있으신가요?
    */
    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);
    const text = messages[messages.length - 1].content;
    
    await this.init();

    const response = await this.agentExecutor.invoke({
      input: text,
      chat_history: previousMessages
    });
    //console.log(response);
    const responseText = response.output;
    return responseText;
  }

  async handleStream(messages, cb) {
    //const historyStr = messages.slice(0, -1).map(formatMessage).join("\n");
    //console.log(historyStr);
    /*
system: 당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다.
    */
    /*
system: 당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다.
user: 반갑습니다
assistant: 안녕하세요! 반갑습니다. 궁금한 점이 있으신가요?
    */
    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);
    const text = messages[messages.length - 1].content;
    
    await this.init();
    
    const logStream = this.agentExecutor.streamLog({
      input: text,
      chat_history: previousMessages,
    });

    const textEncoder = new TextEncoder();
    const transformStream = new ReadableStream({
      async start(controller) {
        var text = "";//
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
            const addOp = chunk.ops[0];
            if (
              addOp.path.startsWith("/logs/ChatOpenAI") &&
              typeof addOp.value === "string" &&
              addOp.value.length
            ) {
              controller.enqueue(textEncoder.encode(addOp.value));
              text = text + addOp.value;//
            }
          }
        }
        controller.close();
        cb(text);
      },
    });

    return transformStream;
  }
}

export default LangchainAgentHandler;

/*
"ChatPromptTemplate"{
   "lc_serializable":true,
   "lc_kwargs":{
      "promptMessages":[
         "SystemMessagePromptTemplate"{
            "lc_serializable":true,
            "lc_kwargs":{
               "prompt":"PromptTemplate"{
                  "lc_serializable":true,
                  "lc_kwargs":{
                     "template":"당신은 제주도 숙소 추천 챗봇 입니다",
                     "inputVariables":[
                        
                     ],
                     "templateFormat":"f-string"
                  },
                  "lc_runnable":true,
                  "name":"undefined",
                  "lc_namespace":[
                     "langchain_core",
                     "prompts",
                     "prompt"
                  ],
                  "inputVariables":[
                     
                  ],
                  "outputParser":"undefined",
                  "partialVariables":"undefined",
                  "template":"당신은 제주도 숙소 추천 챗봇 입니다",
                  "templateFormat":"f-string",
                  "validateTemplate":true
               }
            },
            "lc_runnable":true,
            "name":"undefined",
            "lc_namespace":[
               "langchain_core",
               "prompts",
               "chat"
            ],
            "inputVariables":[
               
            ],
            "additionalOptions":{
               
            },
            "prompt":"PromptTemplate"{
               "lc_serializable":true,
               "lc_kwargs":{
                  "template":"당신은 제주도 숙소 추천 챗봇 입니다",
                  "inputVariables":[
                     
                  ],
                  "templateFormat":"f-string"
               },
               "lc_runnable":true,
               "name":"undefined",
               "lc_namespace":[
                  "langchain_core",
                  "prompts",
                  "prompt"
               ],
               "inputVariables":[
                  
               ],
               "outputParser":"undefined",
               "partialVariables":"undefined",
               "template":"당신은 제주도 숙소 추천 챗봇 입니다",
               "templateFormat":"f-string",
               "validateTemplate":true
            },
            "messageClass":"undefined",
            "chatMessageClass":"undefined"
         },
         "MessagesPlaceholder"{
            "lc_serializable":true,
            "lc_kwargs":{
               "variableName":"chat_history"
            },
            "lc_runnable":true,
            "name":"undefined",
            "lc_namespace":[
               "langchain_core",
               "prompts",
               "chat"
            ],
            "variableName":"chat_history",
            "optional":false
         },
         "HumanMessagePromptTemplate"{
            "lc_serializable":true,
            "lc_kwargs":{
               "prompt":"PromptTemplate"{
                  "lc_serializable":true,
                  "lc_kwargs":{
                     "template":"{input}",
                     "inputVariables":[
                        "input"
                     ],
                     "templateFormat":"f-string"
                  },
                  "lc_runnable":true,
                  "name":"undefined",
                  "lc_namespace":[
                     "langchain_core",
                     "prompts",
                     "prompt"
                  ],
                  "inputVariables":[
                     "input"
                  ],
                  "outputParser":"undefined",
                  "partialVariables":"undefined",
                  "template":"{input}",
                  "templateFormat":"f-string",
                  "validateTemplate":true
               }
            },
            "lc_runnable":true,
            "name":"undefined",
            "lc_namespace":[
               "langchain_core",
               "prompts",
               "chat"
            ],
            "inputVariables":[
               "input"
            ],
            "additionalOptions":{
               
            },
            "prompt":"PromptTemplate"{
               "lc_serializable":true,
               "lc_kwargs":{
                  "template":"{input}",
                  "inputVariables":[
                     "input"
                  ],
                  "templateFormat":"f-string"
               },
               "lc_runnable":true,
               "name":"undefined",
               "lc_namespace":[
                  "langchain_core",
                  "prompts",
                  "prompt"
               ],
               "inputVariables":[
                  "input"
               ],
               "outputParser":"undefined",
               "partialVariables":"undefined",
               "template":"{input}",
               "templateFormat":"f-string",
               "validateTemplate":true
            },
            "messageClass":"undefined",
            "chatMessageClass":"undefined"
         },
         "MessagesPlaceholder"{
            "lc_serializable":true,
            "lc_kwargs":{
               "variableName":"agent_scratchpad"
            },
            "lc_runnable":true,
            "name":"undefined",
            "lc_namespace":[
               "langchain_core",
               "prompts",
               "chat"
            ],
            "variableName":"agent_scratchpad",
            "optional":false
         }
      ],
      "inputVariables":[
         "chat_history",
         "input",
         "agent_scratchpad"
      ]
   },
   "lc_runnable":true,
   "name":"undefined",
   "lc_namespace":[
      "langchain_core",
      "prompts",
      "chat"
   ],
   "inputVariables":[
      "chat_history",
      "input",
      "agent_scratchpad"
   ],
   "outputParser":"undefined",
   "partialVariables":"undefined",
   "promptMessages":[
      "SystemMessagePromptTemplate"{
         "lc_serializable":true,
         "lc_kwargs":{
            "prompt":"PromptTemplate"{
               "lc_serializable":true,
               "lc_kwargs":{
                  "template":"당신은 제주도 숙소 추천 챗봇 입니다",
                  "inputVariables":[
                     
                  ],
                  "templateFormat":"f-string"
               },
               "lc_runnable":true,
               "name":"undefined",
               "lc_namespace":[
                  "langchain_core",
                  "prompts",
                  "prompt"
               ],
               "inputVariables":[
                  
               ],
               "outputParser":"undefined",
               "partialVariables":"undefined",
               "template":"당신은 제주도 숙소 추천 챗봇 입니다",
               "templateFormat":"f-string",
               "validateTemplate":true
            }
         },
         "lc_runnable":true,
         "name":"undefined",
         "lc_namespace":[
            "langchain_core",
            "prompts",
            "chat"
         ],
         "inputVariables":[
            
         ],
         "additionalOptions":{
            
         },
         "prompt":"PromptTemplate"{
            "lc_serializable":true,
            "lc_kwargs":{
               "template":"당신은 제주도 숙소 추천 챗봇 입니다",
               "inputVariables":[
                  
               ],
               "templateFormat":"f-string"
            },
            "lc_runnable":true,
            "name":"undefined",
            "lc_namespace":[
               "langchain_core",
               "prompts",
               "prompt"
            ],
            "inputVariables":[
               
            ],
            "outputParser":"undefined",
            "partialVariables":"undefined",
            "template":"당신은 제주도 숙소 추천 챗봇 입니다",
            "templateFormat":"f-string",
            "validateTemplate":true
         },
         "messageClass":"undefined",
         "chatMessageClass":"undefined"
      },
      "MessagesPlaceholder"{
         "lc_serializable":true,
         "lc_kwargs":{
            "variableName":"chat_history"
         },
         "lc_runnable":true,
         "name":"undefined",
         "lc_namespace":[
            "langchain_core",
            "prompts",
            "chat"
         ],
         "variableName":"chat_history",
         "optional":false
      },
      "HumanMessagePromptTemplate"{
         "lc_serializable":true,
         "lc_kwargs":{
            "prompt":"PromptTemplate"{
               "lc_serializable":true,
               "lc_kwargs":{
                  "template":"{input}",
                  "inputVariables":[
                     "input"
                  ],
                  "templateFormat":"f-string"
               },
               "lc_runnable":true,
               "name":"undefined",
               "lc_namespace":[
                  "langchain_core",
                  "prompts",
                  "prompt"
               ],
               "inputVariables":[
                  "input"
               ],
               "outputParser":"undefined",
               "partialVariables":"undefined",
               "template":"{input}",
               "templateFormat":"f-string",
               "validateTemplate":true
            }
         },
         "lc_runnable":true,
         "name":"undefined",
         "lc_namespace":[
            "langchain_core",
            "prompts",
            "chat"
         ],
         "inputVariables":[
            "input"
         ],
         "additionalOptions":{
            
         },
         "prompt":"PromptTemplate"{
            "lc_serializable":true,
            "lc_kwargs":{
               "template":"{input}",
               "inputVariables":[
                  "input"
               ],
               "templateFormat":"f-string"
            },
            "lc_runnable":true,
            "name":"undefined",
            "lc_namespace":[
               "langchain_core",
               "prompts",
               "prompt"
            ],
            "inputVariables":[
               "input"
            ],
            "outputParser":"undefined",
            "partialVariables":"undefined",
            "template":"{input}",
            "templateFormat":"f-string",
            "validateTemplate":true
         },
         "messageClass":"undefined",
         "chatMessageClass":"undefined"
      },
      "MessagesPlaceholder"{
         "lc_serializable":true,
         "lc_kwargs":{
            "variableName":"agent_scratchpad"
         },
         "lc_runnable":true,
         "name":"undefined",
         "lc_namespace":[
            "langchain_core",
            "prompts",
            "chat"
         ],
         "variableName":"agent_scratchpad",
         "optional":false
      }
   ],
   "validateTemplate":true
}
*/
