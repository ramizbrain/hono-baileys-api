# Wakuu WhatsApp API

API untuk integrasi WhatsApp menggunakan Hono dan Baileys

## Instalasi
```bash
npm install
npm run dev
```

## Fitur Utama
- 🔐 Validasi API dengan secret key
- 🔄 WebSocket untuk streaming pesan masuk secara real-time
- 🤖 Dukungan untuk integrasi dengan AI
- 📱 Manajemen sesi WhatsApp
- 💬 Pengiriman dan penerimaan pesan

## Konfigurasi
Buat file `.env` dengan isi:
```
MONGO_URI=mongodb://localhost:27017/wakuu
WAKUU_SECRET_KEY="your-secret-key-here"
```

## Endpoint Utama

### 🔐 Autentikasi
Semua endpoint memerlukan validasi secret key yang bisa disertakan dengan salah satu cara berikut:
- Header: `Authorization: Bearer your-secret-key`
- Form/JSON: `wakuu_secret_key: "your-secret-key"`
- Query parameter: `?wakuu_secret_key=your-secret-key`

### 🛠 Manajemen Session
- `POST /api/session/:sessionId/:phoneNumber` - Membuat sesi baru
- `GET /api/session` - List semua sesi
- `GET /api/session/:sessionId` - Detail sesi
- `DELETE /api/session/:sessionId` - Hapus sesi

### 💬 Pesan
- `POST /api/:sessionId/messages` - Kirim pesan
```json
{
  "chatId": "628123456789@s.whatsapp.net",
  "message": "Isi pesan",
  "wakuu_secret_key": "your-secret-key"
}
```

### 🔄 WebSocket (Streaming Pesan)
- `GET /api/ws?sessionId=your-session-id` - WebSocket endpoint untuk menerima pesan secara real-time

Contoh koneksi WebSocket:
```javascript
const ws = new WebSocket(`ws://localhost:3000/api/ws?sessionId=sesi-saya`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Pesan baru:', data);
  // data.messages berisi array pesan yang masuk
  // data.messages[0].key.remoteJid berisi nomor pengirim
  // data.messages[0].pushName berisi nama pengirim
  // data.messages[0].message berisi isi pesan
};
```

### 📱 Kontak
- `GET /api/:sessionId/contacts` - List kontak
- `GET /api/:sessionId/contacts/blocklist` - List kontak diblokir

### 👥 Grup
- `GET /api/:sessionId/groups` - List grup

## Contoh Penggunaan
```bash
# Inisiasi sesi
curl -X POST "http://localhost:3000/api/session/sesi-saya/628123456789?wakuu_secret_key=your-secret-key"

# Kirim pesan
curl -X POST -H "Content-Type: application/json" -d '{
  "chatId": "628123456789@s.whatsapp.net",
  "message": "Pesan test",
  "wakuu_secret_key": "your-secret-key"
}' http://localhost:3000/api/sesi-saya/messages
```

## Integrasi dengan AI
Gunakan WebSocket untuk menerima pesan masuk secara real-time, proses dengan AI, dan kirim balasan menggunakan endpoint API.

```javascript
// Contoh integrasi dengan AI
const ws = new WebSocket(`ws://localhost:3000/api/ws?sessionId=sesi-saya`);

ws.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  
  // Hanya proses pesan baru
  if (data.type === 'new-message') {
    for (const message of data.messages) {
      // Dapatkan informasi pengirim
      const sender = message.key.remoteJid;
      const senderName = message.pushName;
      
      // Dapatkan isi pesan
      const textMessage = message.message?.conversation || 
                         message.message?.extendedTextMessage?.text || 
                         '';
      
      // Proses dengan AI (contoh)
      const aiResponse = await processWithAI(textMessage);
      
      // Kirim balasan
      await fetch(`http://localhost:3000/api/${data.sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: sender,
          message: aiResponse,
          wakuu_secret_key: 'your-secret-key'
        })
      });
    }
  }
};

async function processWithAI(text) {
  // Implementasi integrasi dengan AI di sini
  return `Balasan untuk: ${text}`;
}
```

## Lisensi
MIT
