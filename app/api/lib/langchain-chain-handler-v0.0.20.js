/*
process.env.OPENAI_API_KEY
*/
/*
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
*/
import { PromptTemplate, ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { pull } from "langchain/hub";
import { ChatOpenAI } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { OpenAIEmbeddings } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SystemMessage, AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

var client = null;
const getSupabaseVectorStore = (tableName, queryName, model) => {
    if (!client)
        client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
        );
    if (!model)
        model="text-embedding-ada-002";
    const embedding = new OpenAIEmbeddings({model, openAIApiKey: process.env.OPENAI_API_KEY});
    const vectorStore = new SupabaseVectorStore(
      embedding, 
      {
        client,
        tableName: tableName,
        queryName: queryName
      }
    );
    return vectorStore;
}

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

class LangchainChainHandler {
  constructor() {     
   this.chain = null;
  }

  async init() {
      const { data: aiSetting } = await supabase
      .from('AiSetting')
      .select('*')
      .single();

      process.env.OPENAI_API_KEY = aiSetting.openaiApiKey;

      console.log(process.env.OPENAI_API_KEY);

      /*
      const promptTemplate = `당신은 크랜베리 챗봇 제작 회사 도우미 챗봇 입니다.

      Use the following pieces of context to answer the question at the end.
      If you don't know the answer, just say that you don't know, don't try to make up an answer.
      ----------------
      {context}

      Chat history:
      {chat_history}

      user: {input}`;
      const prompt = PromptTemplate.fromTemplate(chatPrompt);
      */
      ///*
      const systemMessagePrompt = `${aiSetting.systemPrompt}

Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
      //const chatHistory = new MessagesPlaceholder("chat_history")
      //chatHistory.optional = true;
      const prompt = ChatPromptTemplate.fromMessages([
         ("system", systemMessagePrompt),
         //SystemMessagePromptTemplate.fromTemplate(systemMessagePrompt),
         new MessagesPlaceholder("chat_history"),
         //chatHistory,
         ("human", "{input}")
         //HumanMessagePromptTemplate.fromTemplate("{input}")
      ]);
      //*/
      /*
      //https://smith.langchain.com/hub/cranberry/job-knowledge-chat
      const prompt = await pull<ChatPromptTemplate>("cranberry/job-knowledge-chat");
      */

      const llm = new ChatOpenAI({
         //modelName: "gpt-3.5-turbo"
         //modelName: "gpt-4"
         modelName: aiSetting.openaiModelName
      });

      //inject

      const vectorStore = getSupabaseVectorStore("documents", "match_documents");
      const retriever = vectorStore.asRetriever(3);

      this.chain = RunnableSequence.from([
         {
            context: RunnableSequence.from([(input) => input.input, retriever, formatDocumentsAsString]),
            input: (input) => input.input,
            chat_history: (input) => input.chat_history
         },
         prompt,
         llm,
         new StringOutputParser(),
      ]);
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

    const response = await this.chain.invoke({
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
    
    const logStream = this.chain.streamLog({
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

export default LangchainChainHandler;

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
