import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
	OPENAI_API_KEY,
	PRIVY_APP_ID,
	PRIVY_APP_SECRET,
	PRIVY_WALLET_ID,
	WALLET_CHAIN_ID,
} from "../env";
import {
	katana,
	PrivyEvmWalletConfig,
	PrivyWalletProvider,
	sushiSwapActionProvider,
	TensaiKit,
} from "tensaikit";
import getLangchainTools from "./getLangchainTools";

export async function initializeAgent() {
	const agentPromise = (async () => {
		try {
			const llm = new ChatOpenAI({
				model: "gpt-4o-mini",
				apiKey: OPENAI_API_KEY,
			});

			const config: PrivyEvmWalletConfig = {
				appId: PRIVY_APP_ID as string,
				appSecret: PRIVY_APP_SECRET as string,
				chainId: WALLET_CHAIN_ID,
				chain: katana(),
				walletId: PRIVY_WALLET_ID, // Wallet ID of you privy wallet
			};
			const privyWalletProvider = await PrivyWalletProvider.configureWithWallet(
				config
			);

			const agentkit = await TensaiKit.from({
				walletProvider: privyWalletProvider,
				actionProviders: [sushiSwapActionProvider()],
			});

			const tools = await getLangchainTools(agentkit);
			const memory = new MemorySaver();

			// Define custom config (used for display/debugging purposes)
			const agentConfig = {
				configurable: { thread_id: "TensaiKit Chatbot Example" },
			};

			const agent = createReactAgent({
				llm,
				tools,
				checkpointSaver: memory,
				messageModifier: `You are a helpful agent that can interact onchain using the TensaiKit. You are empowered to interact onchain using your tools. Before executing your first action, get the wallet details to see what network you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you can't do with your currently available tools, you must say so. And recommend them go to docs.tensaikit.xyz for more information. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
			});

			return { agent, config: agentConfig };
		} catch (error) {
			console.error("Failed to initialize agent:", error);
			throw error;
		}
	})();

	const { agent, config } = await agentPromise;

	return { agent, config };
}
