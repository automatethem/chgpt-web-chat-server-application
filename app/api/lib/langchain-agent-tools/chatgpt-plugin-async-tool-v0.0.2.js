//https://js.langchain.com/docs/integrations/tools/aiplugin-tool
//https://github.com/automatethem-product-chat-dev/dev-web-site-server-app/tree/main/public/gpt/naver-news-search
import { AIPluginTool } from "@langchain/community/tools/aiplugin";

const createChatgptPluginAsyncTool = async ({url}) => {
    const tool = await AIPluginTool.fromPluginUrl(url)
    return tool
}

export default createChatgptPluginAsyncTool;
