import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9,
});

const template = `
You are a helpful AI assistant integrated into a web-based IDE.
Your task is to assist the user with their coding tasks.
You can generate code, refactor code, run tests, and more.
You have access to the user's current file path, content, and file tree.

Current file path: {filePath}
Current file content:
{content}

File tree:
{tree}

User query: {query}

Response:
`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ["filePath", "content", "tree", "query"],
});

const chain = new LLMChain({ llm, prompt });

export const aiService = {
  runTask: async (
    query: string,
    filePath?: string,
    content?: string,
    tree?: string
  ) => {
    const response = await chain.call({
      query,
      filePath: filePath || "N/A",
      content: content || "N/A",
      tree: tree || "N/A",
    });
    return { output: response.text };
  },
};
