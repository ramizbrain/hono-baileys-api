import type { BaileysEventEmitter } from "@whiskeysockets/baileys";

export type MessageHandler = (
	sessionId: string,
	event: BaileysEventEmitter
) => void;
