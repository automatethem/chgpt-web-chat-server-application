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
import { WikipediaQueryRun } from "langchain/tools";
import { pull } from "langchain/hub";

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
  constructor({prompt, promptRepositoryName, tools}) {     
    /*
    this.model = new ChatOpenAI({
      openAIApiKey: openAIApiKey
    });
    */
    this.prompt = prompt;
    this.promptRepositoryName = promptRepositoryName;
    this.tools = tools;
    if (this.tools == null || this.tools.length == 0) {
        const wikipediaTool = new WikipediaQueryRun({
            topKResults: 1,
            maxDocContentLength: 300,
        });
        this.tools.push(wikipediaTool);
    }
    /*
    this.executor = null;
    */
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
      
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });
    
    if (this.promptRepositoryName) {
      this.prompt = await pull(this.promptRepositoryName);
    }

    const agent = await createOpenAIToolsAgent({
      prompt: this.prompt,
      llm: model,
      tools: this.tools,
    });
    
    const agentExecutor = new AgentExecutor({
      agent,
      tools: this.tools
    });
    
    const response = await agentExecutor.invoke({
      input: text,
      chat_history: previousMessages
    });
    //console.log(response);
    const responseText = response.output;
    return responseText;
  }

  async handleStream(messages) {
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
    
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      // IMPORTANT: Must "streaming: true" on OpenAI to enable final output streaming below.
      streaming: true,
    });
    
    if (this.promptRepositoryName) {
      this.prompt = await pull(this.promptRepositoryName);
    }

    const agent = await createOpenAIToolsAgent({
      prompt: this.prompt,
      llm: model,
      tools: this.tools,
    });
    
    const agentExecutor = new AgentExecutor({
      agent,
      tools: this.tools
    });
    
    const logStream = agentExecutor.streamLog({
      input: text,
      chat_history: previousMessages,
    });

    const textEncoder = new TextEncoder();
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
            const addOp = chunk.ops[0];
            if (
              addOp.path.startsWith("/logs/ChatOpenAI") &&
              typeof addOp.value === "string" &&
              addOp.value.length
            ) {
              controller.enqueue(textEncoder.encode(addOp.value));
            }
          }
        }
        controller.close();
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
