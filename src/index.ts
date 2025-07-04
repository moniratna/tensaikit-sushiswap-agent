import express, { Request, Response } from "express";
import { initializeAgent } from "./agentInstance";
import { createChatMode } from "./createChatMode";

const app = express();
const port = 8080;

app.use(express.json());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST");

	next();
});
app.get("/", (req: Request, res: Response) => {
	res.send("Welcome to the katana API!");
});
app.post("/chat", async (req: Request, res: Response): Promise<any> => {
	const { prompt } = req.body;
	if (!prompt) {
		return res.status(400).json({ error: "Prompt is required" });
	}
	try {
		const { agent, config } = await initializeAgent();

		const response = await createChatMode(prompt, agent, config);
		return res.status(200).send({
			message: response.output,
			type: response.name,
		});
	} catch (error: any) {
		console.error("Error in /chat endpoint:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});
app.listen(port, async () => {
	console.log(`Server is running at http://localhost:${port}`);
});
