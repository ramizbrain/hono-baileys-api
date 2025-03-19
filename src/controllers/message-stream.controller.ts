import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import WebSocket from "ws";
import { WebSocketServer } from "ws";
import WhatsappClient from "../../whatsapp/client.js";

// Map untuk menyimpan koneksi WebSocket berdasarkan sessionId
const wsConnections = new Map<string, Set<WebSocket>>();

// Inisialisasi WebSocket server
let wsServer: WebSocketServer | null = null;

// Fungsi untuk mendapatkan atau membuat set koneksi untuk sessionId
function getSessionConnections(sessionId: string): Set<WebSocket> {
  if (!wsConnections.has(sessionId)) {
    wsConnections.set(sessionId, new Set());
  }
  return wsConnections.get(sessionId)!;
}

// Fungsi untuk menginisialisasi WebSocket server
export function initWebSocketServer(server: any) {
  wsServer = new WebSocketServer({ server, path: "/api/ws" });
  
  wsServer.on('connection', (ws: WebSocket, req: any) => {
    // Parse URL untuk mendapatkan sessionId dari query parameter
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      ws.close(1008, 'SessionId tidak ditemukan dalam parameter query');
      return;
    }
    
    // Periksa apakah sesi ada
    if (!WhatsappClient.sessionExists(sessionId)) {
      ws.close(1008, `Sesi ${sessionId} tidak ditemukan`);
      return;
    }
    
    // Tambahkan koneksi ke set untuk sessionId ini
    const connections = getSessionConnections(sessionId);
    connections.add(ws);
    
    // Dapatkan session dan messageHandler
    const session = WhatsappClient.getSession(sessionId)!;
    const messageHandler = session.store.getMessageHandler();
    
    // Buat listener untuk pesan
    const removeListener = messageHandler.addMessageListener((data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
    
    // Kirim pesan selamat datang
    ws.send(JSON.stringify({ 
      type: "connected", 
      message: `Terhubung ke sesi WhatsApp ${sessionId}` 
    }));
    
    // Hapus listener saat koneksi ditutup
    ws.on('close', () => {
      removeListener();
      connections.delete(ws);
      console.log(`WebSocket untuk sesi ${sessionId} ditutup`);
    });
  });
  
  return wsServer;
}

// Fungsi untuk broadcast pesan ke semua koneksi untuk sessionId tertentu
export function broadcastToSession(sessionId: string, data: any) {
  const connections = wsConnections.get(sessionId);
  if (!connections) return;
  
  const message = JSON.stringify(data);
  connections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// Endpoint untuk upgrade ke WebSocket
export const streamMessages = async (c: Context) => {
  const sessionId = c.req.param("sessionId");

  // Periksa apakah sesi ada
  if (!WhatsappClient.sessionExists(sessionId)) {
    throw new HTTPException(404, { message: `Sesi ${sessionId} tidak ditemukan` });
  }

  // Berikan instruksi untuk menggunakan WebSocket API
  return c.json({
    success: true,
    message: "Gunakan WebSocket API untuk streaming pesan",
    wsEndpoint: `/api/ws?sessionId=${sessionId}`,
    instructions: "Hubungkan ke WebSocket endpoint ini untuk menerima pesan secara real-time"
  });
};
