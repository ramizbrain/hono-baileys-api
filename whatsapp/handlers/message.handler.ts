import * as baileys from "@whiskeysockets/baileys";
import type { BaileysEventHandler } from "../../types/baileys.js";
import { logger } from "../../utils/logger.js";
import type { IHandler } from "../contracts/ihandler.js";

export default class MessageHandler implements IHandler {
  private listening = false;
  private messageListeners: Set<(data: any) => void> = new Set();

  constructor(
    private readonly sessionId: string,
    private readonly event: baileys.BaileysEventEmitter
  ) {}

  // Handler untuk pesan masuk baru
  messageUpsert: BaileysEventHandler<"messages.upsert"> = async ({
    messages,
    type,
  }) => {
    try {
      if (type !== "notify") return;

      // Kirim pesan ke semua listener WebSocket
      const messageData = {
        type: "new-message",
        sessionId: this.sessionId,
        messages: messages.map((message) => ({
          key: message.key,
          pushName: message.pushName,
          message: message.message,
          messageTimestamp: message.messageTimestamp,
        })),
      };
      
      this.notifyListeners(messageData);
      
      logger.info(
        { sessionId: this.sessionId, count: messages.length },
        "Pesan baru diterima"
      );
    } catch (error) {
      logger.error(error, "Terjadi kesalahan saat memproses pesan masuk");
    }
  };

  // Tambahkan listener untuk WebSocket
  addMessageListener(callback: (data: any) => void): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  // Kirim notifikasi ke semua listener
  private notifyListeners(data: any): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        logger.error(error, "Terjadi kesalahan saat mengirim notifikasi ke listener");
      }
    });
  }

  listen(): void {
    if (this.listening) return;
    this.listening = true;
    this.event.on("messages.upsert", this.messageUpsert);
  }

  unlisten(): void {
    if (!this.listening) return;
    this.listening = false;
    this.event.off("messages.upsert", this.messageUpsert);
  }
}
