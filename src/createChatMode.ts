import { HumanMessage } from "@langchain/core/messages";

export async function createChatMode(prompt: string, agent: any, config: any) {
	try {
		const stream = await agent.stream(
			{ messages: [new HumanMessage(prompt as string)] },
			config
		);
		let output;
		let name;
		for await (const chunk of stream) {
			if ("agent" in chunk) {
				output = chunk.agent.messages[0].content;
			} else if ("tools" in chunk) {
				name = chunk.tools.messages[0].name;
				output = chunk.tools.messages[0].content;
			}
		}
		return { output, name };
	} catch (error: any) {
		throw new Error("Error in chat mode");
	}
}
