// src/inngest/functions.ts
import { openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  
  async ({ event }) => {
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert Next.js developer. You write code readable and maintainable code. You write simple Next.js and React snippets.",
      model: openai({ model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY }),
    });
    const { output }= await codeAgent.run(`Write the following snippet: ${event.data.value}`);
    return { output };
  }
);