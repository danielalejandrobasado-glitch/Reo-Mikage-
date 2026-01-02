const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    // Escuchar conexión
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ Bot conectado');
        }
    });

    // Guardar credenciales
    sock.ev.on('creds.update', saveCreds);

    // Manejar mensajes - SOLO PING
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        
        // Ignorar si no hay mensaje o no es notificación nueva
        if (!message.message || m.type !== 'notify') return;

        // Obtener texto del mensaje
        const text = message.message.conversation || '';
        const sender = message.key.remoteJid;

        // Solo responder a !ping
        if (text.toLowerCase() === '!ping') {
            const startTime = Date.now();
            
            // Enviar respuesta inmediata
            await sock.sendMessage(sender, { 
                text: '🏓 Pong!' 
            });
            
            const endTime = Date.now();
            const latency = endTime - startTime;
            
            // Enviar latencia
            await sock.sendMessage(sender, {
                text: `📊 Latencia: ${latency}ms`
            });
        }
    });

    return sock;
}

// Iniciar bot
connectToWhatsApp().catch(console.error);