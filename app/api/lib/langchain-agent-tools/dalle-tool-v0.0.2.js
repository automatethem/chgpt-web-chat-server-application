//https://js.langchain.com/docs/integrations/tools/dalle
import { DallEAPIWrapper } from "@langchain/openai";

const createDalleTool = () => {
    const tool = new DallEAPIWrapper({
      n: 1, // Default
      modelName: "dall-e-3", // Default
      openAIApiKey: process.env.OPENAI_API_KEY, // Default
    });
    return tool
}

export default createDalleTool;
