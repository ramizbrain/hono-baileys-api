import pino, { type Logger } from "pino";
import { env } from "process";

export const logger: Logger = pino.pino({
	timestamp: () => `,"time":"${new Date().toJSON()}"`,
	transport: {
		targets: [
			{
				level: env.LOG_LEVEL || "debug",
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		],
	},
	mixin(mergeObject, level) {
		return {
			...mergeObject,
			level: level,
		};
	},
});
