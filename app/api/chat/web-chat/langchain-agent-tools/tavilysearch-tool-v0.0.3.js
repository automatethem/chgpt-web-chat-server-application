/*
process.env.TAVILY_API_KEY
*/
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const createTavilysearchTool = () => {
    const tavilysearchTool = new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY, maxResults: 1 });


    return tavilysearchTool;
};

export default createTavilysearchTool;
