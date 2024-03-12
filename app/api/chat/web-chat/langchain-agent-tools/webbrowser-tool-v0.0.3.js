/*
import webbrowserTool from "./langchain-agent-tools/webbrowser-tool.js"

const input = `https://www.themarginalian.org/2015/04/09/find-your-bliss-joseph-campbell-power-of-myth 이 주소에서 joseph campbell 은 누구인가?`;
const result = await agentExecutor.run(input);
console.log(result);
*/
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { WebBrowser } from "langchain/tools/webbrowser";
//환경 변수 세팅 되어 있지 않은 경우만 환경 변수 세팅 (nextjs edge 에서는 skip)
if (
  !process.env.OPENAI_API_KEY
  ) {
  //import dotenv from "dotenv"; //error
  const dotenv = await import("dotenv")
  dotenv.config();
}

const createWebbrowserTool = () => {
    const model = new ChatOpenAI({ 
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0 
    });
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    const webbrowserTool = new WebBrowser({ model, embeddings });

    return webbrowserTool;
};

export default createWebbrowserTool;
