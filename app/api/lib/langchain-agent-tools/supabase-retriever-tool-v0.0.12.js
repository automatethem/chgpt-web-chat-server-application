/*
process.env.OPENAI_API_KEY
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
*/
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { createRetrieverTool } from "langchain/agents/toolkits";

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

const createSupabaseRetrieverTool = ({ name, description, tableName, queryName }) => {
    if (!name)
        name = "search_documents_about_user_question";
    if (!description)
        description = "Searches and returns documents about user question.";
    if (!tableName)
        tableName = "documents";
    if (!queryName)
        queryName = "match_documents";
    
    const vectorStore = getSupabaseVectorStore(tableName, queryName)
    //https://js.langchain.com/docs/modules/data_connection/vectorstores
    //const retriever = vectorStore.asRetriever(); 
    const retriever = vectorStore.asRetriever(3);
    //console.log(await vectorStore.similaritySearch("크랜배리 챗봇 제작 회사에 대해 소개 해주세요."));
    //console.log(await retriever.invoke("크랜배리 챗봇 제작 회사에 대해 소개 해주세요."));
    //console.log(await retriever.getRelevantDocuments("크랜배리 챗봇 제작 회사에 대해 소개 해주세요."));
    
    const retrieverTool = createRetrieverTool(
        retriever, 
        {
            name: name,
            description: description
        }
    );

    return retrieverTool;
}

export default createSupabaseRetrieverTool;
