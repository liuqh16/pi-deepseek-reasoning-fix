/**
 * Fix for DeepSeek models requiring `reasoning_content` in all assistant messages
 * when thinking mode is enabled.
 *
 * When an old session recorded with a non-thinking model is replayed with a
 * thinking model (e.g. deepseek-v4-pro), the old assistant messages lack
 * `reasoning_content`. The DeepSeek API rejects the request with:
 *
 *   "The `reasoning_content` in the thinking mode must be passed back to the API."
 *
 * This extension intercepts the provider payload and adds an empty
 * `reasoning_content` field to any assistant message that doesn't have one.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

/** Models that require `reasoning_content` in every assistant message. */
const DEEPSEEK_V4_MODELS = new Set([
	"deepseek-v4-pro",
	"deepseek-v4-flash",
]);

function isDeepSeekV4Model(modelId: string): boolean {
	return DEEPSEEK_V4_MODELS.has(modelId.toLowerCase());
}

export default function (pi: ExtensionAPI) {
	pi.on("before_provider_request", (event) => {
		const payload = event.payload as Record<string, unknown> | undefined;
		if (!payload) return;

		// Only patch OpenAI Chat Completions payloads with reasoning models.
		// Non-reasoning providers don't need this field and may choke on it.
		if (!payload.model || !isDeepSeekV4Model(String(payload.model))) return;

		const messages = payload.messages;
		if (!Array.isArray(messages)) return;

		let modified = false;
		const fixed = messages.map((msg: Record<string, unknown>) => {
			if (msg.role === "assistant" && !("reasoning_content" in msg)) {
				modified = true;
				return { ...msg, reasoning_content: "" };
			}
			return msg;
		});

		if (modified) {
			return { ...payload, messages: fixed };
		}
	});
}
