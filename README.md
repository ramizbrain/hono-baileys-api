# Wakuu WhatsApp API

API untuk integrasi WhatsApp menggunakan Hono dan Baileys

## Instalasi
```bash
npm install
npm run dev
```

## Endpoint Utama

### 🛠 Manajemen Session
- `POST /session/:sessionId/:phoneNumber` - Membuat sesi baru
- `GET /session` - List semua sesi
- `GET /session/:sessionId` - Detail sesi
- `DELETE /session/:sessionId` - Hapus sesi

### 💬 Pesan
- `POST /:sessionId/messages` - Kirim pesan
```json
{
  "chatId": "628123456789@s.whatsapp.net",
  "message": "Isi pesan"
}
```

### 📱 Kontak
- `GET /:sessionId/contacts` - List kontak
- `GET /:sessionId/contacts/blocklist` - List kontak diblokir

### 👥 Grup
- `GET /:sessionId/groups` - List grup

## Contoh Penggunaan
```bash
# Inisiasi sesi
curl -X POST http://localhost:3000/session/sesi-saya/628123456789

# Kirim pesan
curl -X POST -H "Content-Type: application/json" -d '{
  "chatId": "628123456789@s.whatsapp.net",
  "message": "Pesan test"
}' http://localhost:3000/sesi-saya/messages
```

## Lisensi
MIT
