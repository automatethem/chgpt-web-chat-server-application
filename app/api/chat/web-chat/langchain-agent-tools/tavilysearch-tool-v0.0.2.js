import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
//환경 변수 세팅 되어 있지 않은 경우만 환경 변수 세팅 (nextjs edge 에서는 skip)
if (
  !process.env.TAVILY_API_KEY 
  ) {
  //import dotenv from "dotenv"; //error
  const dotenv = await import("dotenv")
  dotenv.config();
}

const createTavilysearchTool = () => {
    const tavilysearchTool = new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY, maxResults: 1 });


    return tavilysearchTool;
};

export default createTavilysearchTool;
