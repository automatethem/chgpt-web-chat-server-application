"use client"
import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from 'rehype-external-links';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Page = () => {
  const [privacy, setPrivacy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('WebSiteSetting')
      .select('*')
      .single();
    if (!error && data) {
      setPrivacy(data.privacy);
    }
   
    setLoading(false);
  }, []);

  if (loading)
    return <>loading</>;

  return (
      <div>
          {/*<h1 className="mb-3 text-lg font-bold">{title}</h1>*/}
          <div className="mb-3">
              {/* Using ReactMarkdown to render the message as markdown */}
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: '_blank' }]]}
                components={{
                  // Custom component for 'a' tag to add className
                  a: ({ node, ...props }) => (
                    <a {...props} className="underline text-blue-600 hover:text-blue-800" />
                  ),
                }}
              >
                  {privacy}
              </ReactMarkdown>
          </div>
      </div>
  );
};
export default Page;
