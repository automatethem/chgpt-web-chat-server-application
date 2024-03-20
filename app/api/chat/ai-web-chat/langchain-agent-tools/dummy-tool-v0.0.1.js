import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import * as z from 'zod';

const createDummyTool = () => {
    const dummyTool = new DynamicStructuredTool({
      name: 'dummyTool',
      description: 'Do nothing. This is dummy tool. Do not use this tool.',
      schema: z.object({
      }),
      func: async (options) => {
        return null;
      },
    });

    return dummyTool;
}

export default createDummyTool;
