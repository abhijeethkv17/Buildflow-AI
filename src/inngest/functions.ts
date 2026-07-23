// src/inngest/functions.ts
import { Sandbox } from "@e2b/code-interpreter"
import { openai, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { getSandbox } from "./utils";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async() => {
      const sandbox = await Sandbox.create("abhijeeths-default-team/buildflow-nextjs-test");
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert Next.js developer. You write code readable and maintainable code. You write simple Next.js and React snippets.",
      model: openai({ model: "gpt-4.0-mini", apiKey: process.env.OPENAI_API_KEY }),
    });
    const { output }= await codeAgent.run(`Write the following snippet: ${event.data.value}`);

    const sandboxUrl = await step.run("get-sandbox-url", async() => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    return { output, sandboxUrl };
  }
);