//process.env.TAVILY_API_KEY
/*
이것이 바로 우리가 AI 에이전트를 위한 최초의 검색 엔진인 Tavily Search API를 소개하게 된 것을 기쁘게 생각하는 이유입니다 .
https://app.tavily.com/documentation/intro
API를 실제로 사용해 보려면 이제 여기 또는 API 놀이터 에서 호스팅 버전의 GPT Researcher를 사용할 수 있습니다 .
https://app.tavily.com/chat
https://app.tavily.com/playground
*/
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const createTavilysearchTool = () => {
    const tavilysearchTool = new TavilySearchResults({ maxResults: 1 });
    return tavilysearchTool;
};

export default createTavilysearchTool;
