//OPENAI_API_KEY
/*
https://js.langchain.com/docs/integrations/tools/webbrowser
*/
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { WebBrowser } from "langchain/tools/webbrowser";

const createWebbrowserTool = () => {
    const model = new ChatOpenAI({ 
      temperature: 0 
    });
    const embeddings = new OpenAIEmbeddings();
    const webbrowserTool = new WebBrowser({ model, embeddings });

    return webbrowserTool;
};

export default createWebbrowserTool;
