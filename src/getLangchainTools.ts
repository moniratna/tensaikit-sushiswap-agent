import { TensaiKit } from "tensaikit";
import { tool } from "@langchain/core/tools";
async function getLangchainTools(agentKit: TensaiKit) {
	const actions = agentKit.getActions();

	return actions.map((action: any) =>
		tool(
			async (arg) => {
				const result = await action.invoke(arg);
				return result;
			},
			{
				name: action.name,
				description: action.description,
				schema: action.schema,
			}
		)
	);
}
export default getLangchainTools;
