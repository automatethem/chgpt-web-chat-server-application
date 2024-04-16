//https://medium.com/@xhowais/next-js-file-upload-api-tutorial-local-directroy-7ec039efbd66
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
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

const getDocumentsFromFile = async (file, textSplitter) => {
    var loader = null;
    if (file.endsWith(".txt")) {
        loader = new TextLoader(file); 
    }
    else if (file.endsWith(".docx")) {
        loader = new DocxLoader(file); 
    }
    else if (file.endsWith(".pdf")) {
        loader = new PDFLoader(file); 
    }
    else if (file.endsWith(".csv")) {
        loader = new CSVLoader(file); 
    }
    else if (file.endsWith(".json")) {
        loader = new JSONLoader(file); 
        //loader = new JSONLinesLoader(path); 
    }
    var documents = await loader.load();
    //console.log(documents.length); //1
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
    const formData = await request.formData();

    const file = formData.get("files");
    var fileName = file.name;
    //fileName = fileName.replaceAll(" ", "_");
    const filepath = "/tmp/" + fileName;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);
  
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
  
    const documents = await getDocumentsFromFile(filepath, textSplitter)
  
    const { data: aiSetting } = await supabase
    .from('AiSetting')
    .select('*')
    .single();
  
    process.env.OPENAI_API_KEY = aiSetting.openaiApiKey;
  
    const vectorStore = await createSupabaseVectorStore({ documents: documents, tableName: "documents", queryName: "match_documents" })
  
    return NextResponse.json({ Message: "Success", status: 201 });
}

//export const runtime = 'nodejs' //디폴트 
//export const runtime = 'edge'
