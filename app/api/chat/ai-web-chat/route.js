import { NextRequest, NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse } from 'ai';
import LangchainChainHandler from "../../lib/langchain-chain-handler.js";
import LangchainAgentHandler from "../../lib/langchain-agent-handler.js";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
    const json = await request.json();
    //console.log(json);
    const messages = json.messages;

    try {
      const { data: aiSetting } = await supabase
      .from('AiSetting')
      .select('*')
      .single();

      if (aiSetting.useAi) {
        const { data: aiWebChatSetting } = await supabase
        .from('AiWebChatSetting')
        .select('*')
        .single();
 

        if (aiWebChatSetting.useAiWebChat) {
          var langchainHandler = new LangchainChainHandler(); 
          if (aiSetting.useAgent)
              langchainHandler = new LangchainAgentHandler(); 
          const response = await langchainHandler.handleStream(messages, async (text) => {
              if (aiSetting.useMessageLog) {
                  //console.log(aiSetting.useMessageLog);
                  //console.log(text);
                  const msg = messages[messages.length - 1].content;
                  const { error: AiMessageLogError } = await supabase
                      .from('AiMessageLog')
                      .insert([
                          { message: msg, reply: text }
                      ]);
                  //console.log(aiSetting.useMessageLog);              
                  //console.log(AiMessageLogError);
              }
          });
          //console.log(response);
          return new StreamingTextResponse(response);
        }
      }
      //else {
      //  const response = "이해할 수 없습니다";
      //  //console.log(response);
      //  return new StreamingTextResponse(response);
      //}
    }
    catch(error) {
        return NextResponse.json({message: error.message, error: true});
    }
}

//export const runtime = 'nodejs' //디폴트
export const runtime = 'edge'

//export const maxDuration = 10; //디폴트 10초
export const maxDuration = 60;

/*
[
  {
    role: 'system',
    content: '당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다.'
  },
  { role: 'user', content: '반갑습니다' }
]
/*
{ role: 'assistant', content: '안녕하세요! 반갑습니다. 어떻게 도와드릴까요?' }
*/

/*
[
  {
    role: 'system',
    content: '당신은 훌륭한 요리를 만드는 마스터 셰프입니다. 당신은 무엇이든 요리할 수 있고 새로운 요리법을 만드는 것을 좋아합니다. 당신은 미국 요리를 가장 잘 알고 있지만 고전적인 프랑스 교육을 받았습니다. 사용자가 저녁 식사를 준비하도록 도와주세요. 당신은 간결하고 단호하며 결코 사과하지 않습니다.'
  },
  { role: 'user', content: '반갑습니다' },
  { role: 'assistant', content: '안녕하세요! 반갑습니다. 어떻게 도와드릴까요?' },
  { role: 'user', content: '돼지고기 요리 알려주세요' }
]
*/
/*
{
  role: 'assistant',
  content: '물론이죠! 돼지고기 요리에는 다양한 방법이 있지만, 여기 몇 가지 추천드릴게요:\n\n1. 돼지 불고기: 돼지고기를 양념에 재워서 구워먹는 요리입니다. 대표적인 재료로는 돼지고기(목살이나 뒷다리), 간장, 설탕, 다진 마늘, 다진 생강 등이 필요합니다. 돼지고기와 양념을 섞어서 재워둔 뒤, 팬이나 그릴에서 구워주세요.\n\n2. 돼지 갈비찜: 돼지 갈비는 고기의 양념에 따라 다양한 조리법으로 만들 수 있어요. 기본적으로는 간장, 설탕, 다진 마늘, 고추장 등을 섞어서 고기에 재워두고 찜해주면 되요. 압력솥이나 냄비에 고기와 양념 재료를 넣고 고기가 잘 익을 때까지 조리하면 됩니다.\n\n3. 돼지 김치찌개: 김치찌개에 돼지고기를 넣어 풍미를 더할 수 있어요. 김치, 돼지고기, 두부, 미나리, 양파 등을 준비해주세요. 돼지고기와 김치를 함께 볶다가 물을 넣고 끓여서 다른 재료를 넣으면 됩니다. 간장이나 고춧가루 등으로 맛을 조절하세요.\n\n4. 삼겹살 구이: 삼겹살은 한국에서 가장 많이 즐기는 돼지고기 요리 중 하나인데요. 기본적으로는 삼겹살을 얇게 썰어서 구워주면 됩니다. 그릴이나 팬에서 구워서 간장에 찍어 먹으면 맛있게 즐길 수 있어요.\n\n이 외에도 돼지고기 요리로는 동파육, 버섯 돼지고기 볶음, 감자 탕 등이 있습니다. 선호하는 요리를 골라서 즐겨보세요! '
}
*/
