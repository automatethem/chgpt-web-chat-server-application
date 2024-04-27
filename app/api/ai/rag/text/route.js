import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { Document } from "langchain/document";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { JSONLoader, JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

//https://js.langchain.com/docs/modules/data_connection/document_transformers/
//https://stackoverflow.com/a/77014034
const getDocumentsFromText = async (text, source, textSplitter) => {
    if(!source) {
        source = "text"
    }
    const document = new Document({ pageContent: text, metadata: {source: source} });
    var documents = [document]
    if (textSplitter) {
        documents = await textSplitter.splitDocuments(documents)
    }
    //console.log(documents.length); //157
    return documents
}

var client = null;
const createSupabaseVectorStore = async ({ documents, tableName, queryName, model }) => {
    if (!client)
        client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
        );
    if (!model)
        model = "text-embedding-ada-002";
    const embedding = new OpenAIEmbeddings(model);
    const vectorStore = await SupabaseVectorStore.fromDocuments(
        documents, 
        embedding, 
        {
            client: client,
            tableName: tableName,
            queryName: queryName
        }
    );
};

export async function POST(request) {
    const { data: aiRagTexts, error } = await supabase
        .from('AiRagText')
        .select('*')
        .order('date', { ascending: false });

    var lines = '';
    for (var text of aiRagTexts) {
        const id = text.id;
        const title = text.title;
        const message = text.message;
        const vectorize = text.vectorize;
        if (vectorize) {
            //lines = lines + 'title: \n' + title + '\n\n';
            //lines = lines + 'message: \n' + message + '\n\n';
            lines = lines + message + '\n\n';
            lines = lines + '==========\n\n';
        }
    }
    
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
  
    const documents = await getDocumentsFromText(lines, "text", textSplitter)
  
    const { data: aiSetting } = await supabase
    .from('AiSetting')
    .select('*')
    .single();
  
    process.env.OPENAI_API_KEY = aiSetting.openaiApiKey;

    //DELETE FROM documents WHERE (metadata->'source') = '"text"';
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .match({ 'metadata->source': '"text"' }); 
    
    const vectorStore = await createSupabaseVectorStore({ documents: documents, tableName: "documents", queryName: "match_documents" })
  
    return NextResponse.json({ Message: "Success", status: 201 });
}

//export const runtime = 'nodejs' //디폴트 
//export const runtime = 'edge'
