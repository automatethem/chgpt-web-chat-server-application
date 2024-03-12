import { createRetrieverTool } from "langchain/agents/toolkits";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
//환경 변수 세팅 되어 있지 않은 경우만 환경 변수 세팅 (nextjs edge 에서는 skip)
if (
  !process.env.OPENAI_API_KEY ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  ) {
  //import dotenv from "dotenv"; //error
  const dotenv = await import("dotenv")
  dotenv.config();
}

const createSupabaseRetrieverTool = ({tableName, queryName, name, description}) => {
    if (!tableName)
        tableName = "documents";
    if (!queryName)
        queryName = "match_documents";
    if (!name)
        name = "search_state_of_union";
    if (!description)
        description = "Searches and returns documents regarding the state-of-the-union.";

    const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
          );
    const vectorStore = new SupabaseVectorStore(
      new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_API_KEY}), 
      {
        client,
        //tableName: "documents",
        //queryName: "match_documents"
        tableName: tableName,
        queryName: queryName
      }
    );
    
    //console.log( await vectorStore.similaritySearch("제주도 숙소 추천해 주세요."));
    
    const retriever = vectorStore.asRetriever();
    
    //console.log(await retriever.invoke("제주도 숙소 추천해 주세요."));
    
    const supabaseRetrieverTool = createRetrieverTool(retriever, {
      //name: "search_state_of_union",
      //description: "Searches and returns documents regarding the state-of-the-union."
      name: name,
      description: description
    });

    return supabaseRetrieverTool;
}

export default createSupabaseRetrieverTool;
