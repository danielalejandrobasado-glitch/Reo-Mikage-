/**
 * Archivo principal del bot de WhatsApp usando Baileys
 * Gestiona la conexión, autenticación y comunicación con WhatsApp
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const Handler = require('./handler');
const path = require('path');
const fs = require('fs');

class WhatsAppBot {
    /**
     * Constructor del bot
     * @param {Object} config - Configuración del bot
     */
    constructor(config = {}) {
        this.config = {
            prefix: config.prefix || '!',
            owner: config.owner || '', // Número del dueño con código de país
            sessionName: config.sessionName || 'session',
            authPath: config.authPath || './auth_info',
            reconnectAttempts: config.reconnectAttempts || 5,
            ...config
        };

        // Inicializar handler
        this.handler = new Handler({
            prefix: this.config.prefix,
            socket: null
        });

        // Estado de conexión
        this.socket = null;
        this.isConnected = false;
        this.reconnectCount = 0;

        // Configurar directorio de autenticación
        if (!fs.existsSync(this.config.authPath)) {
            fs.mkdirSync(this.config.authPath, { recursive: true });
        }

        // Manejar señales de terminación
        this._setupProcessHandlers();
    }

    /**
     * Configura handlers para señales del proceso
     * @private
     */
    _setupProcessHandlers() {
        process.on('SIGINT', () => this.close('SIGINT'));
        process.on('SIGTERM', () => this.close('SIGTERM'));
        process.on('uncaughtException', (error) => {
            console.error('Excepción no capturada:', error);
        });
    }

    /**
     * Inicializa la conexión con WhatsApp
     */
    async initialize() {
        console.log('🚀 Inicializando bot de WhatsApp...');
        
        try {
            // Cargar estado de autenticación
            const { state, saveCreds } = await useMultiFileAuthState(this.config.authPath);
            
            // Crear socket de conexión
            this.socket = makeWASocket({
                auth: state,
                printQRInTerminal: true,
                browser: Browsers.ubuntu('Chrome'),
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                emitOwnEvents: true
            });

            // Configurar socket en el handler
            this.handler.setSocket(this.socket);

            // Manejar actualizaciones de credenciales
            this.socket.ev.on('creds.update', saveCreds);

            // Manejar actualizaciones de conexión
            this.socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                console.log(`🔄 Estado de conexión: ${connection}`);
                this.handler.emitEvent('connection', connection);

                if (connection === 'open') {
                    this.isConnected = true;
                    this.reconnectCount = 0;
                    console.log('✅ Conexión establecida con WhatsApp');
                    await this._onConnected();
                } else if (connection === 'close') {
                    this.isConnected = false;
                    const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
                    
                    if (shouldReconnect && this.reconnectCount < this.config.reconnectAttempts) {
                        this.reconnectCount++;
                        console.log(`🔄 Intentando reconectar... (${this.reconnectCount}/${this.config.reconnectAttempts})`);
                        setTimeout(() => this.initialize(), 5000);
                    } else {
                        console.log('❌ No se pudo reconectar. Reinicia la sesión.');
                        this.close('connection_close');
                    }
                }

                // Mostrar QR si es necesario
                if (qr) {
                    console.log('📱 Escanea el código QR con WhatsApp');
                }
            });

            // Manejar mensajes entrantes
            this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return;

                for (const message of messages) {
                    // Ignorar mensajes del propio bot
                    if (message.key.fromMe) continue;

                    await this._processIncomingMessage(message);
                }
            });

            // Manejar errores
            this.socket.ev.on('error', (error) => {
                console.error('❌ Error en el socket:', error);
            });

        } catch (error) {
            console.error('❌ Error inicializando el bot:', error);
            throw error;
        }
    }

    /**
     * Se ejecuta cuando la conexión es exitosa
     * @private
     */
    async _onConnected() {
        console.log('🤖 Bot listo para recibir comandos');
        
        // Obtener información del bot
        const user = this.socket.user;
        console.log(`👤 Conectado como: ${user?.id?.split(':')[0]}`);
        
        // Enviar mensaje de inicio al dueño si está configurado
        if (this.config.owner) {
            await this.sendMessage(this.config.owner, {
                text: `✅ Bot conectado exitosamente!\n\n` +
                      `• Usuario: ${user?.id?.split(':')[0]}\n` +
                      `• Prefijo: ${this.config.prefix}\n` +
                      `• Hora: ${new Date().toLocaleString()}`
            });
        }
    }

    /**
     * Procesa un mensaje entrante
     * @param {Object} message - Mensaje de WhatsApp
     * @private
     */
    async _processIncomingMessage(message) {
        try {
            // Extraer información básica
            const messageData = {
                body: message.message?.conversation || 
                      message.message?.extendedTextMessage?.text || 
                      '',
                sender: message.key.remoteJid,
                from: message.key.remoteJid,
                chat: {
                    id: message.key.remoteJid
                },
                timestamp: message.messageTimestamp,
                messageId: message.key.id,
                isGroup: message.key.remoteJid.endsWith('@g.us'),
                pushName: message.pushName || 'Usuario'
            };

            console.log(`📩 Mensaje de ${messageData.pushName}: ${messageData.body}`);

            // Procesar a través del handler
            const response = await this.handler.processMessage(messageData);
            
            // Enviar respuesta si existe
            if (response && response.text) {
                await this.sendMessage(messageData.sender, {
                    text: response.text,
                    quoted: response.reply ? message : null
                });
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    }

    /**
     * Envía un mensaje a un chat
     * @param {string} chatId - ID del chat
     * @param {Object} options - Opciones del mensaje
     * @returns {Promise<Object>} - Resultado del envío
     */
    async sendMessage(chatId, options) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Bot no conectado');
        }

        try {
            return await this.socket.sendMessage(chatId, {
                text: options.text,
                ...options
            });
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            throw error;
        }
    }

    /**
     * Cierra la conexión del bot
     * @param {string} reason - Razón del cierre
     */
    async close(reason = 'shutdown') {
        console.log(`\n🛑 Cerrando bot (${reason})...`);
        
        try {
            if (this.socket) {
                await this.socket.end();
            }
            
            console.log('👋 Bot cerrado correctamente');
            process.exit(0);
        } catch (error) {
            console.error('Error cerrando el bot:', error);
            process.exit(1);
        }
    }

    /**
     * Obtiene el handler para agregar comandos personalizados
     * @returns {Handler} - Instancia del handler
     */
    getHandler() {
        return this.handler;
    }

    /**
     * Verifica el estado de conexión
     * @returns {boolean} - True si está conectado
     */
    isConnected() {
        return this.isConnected;
    }
}

/**
 * Función principal para iniciar el bot
 */
async function main() {
    console.log('========================================');
    console.log('🤖 BOT DE WHATSAPP - CON BAILEYS');
    console.log('========================================\n');

    // Configuración del bot
    const config = {
        prefix: '!',           // Prefijo para comandos
        owner: '5491122334455@c.us',  // Reemplaza con tu número (código de país + número)
        sessionName: 'my-bot-session',
        authPath: './auth_info',
        reconnectAttempts: 10
    };

    // Crear instancia del bot
    const bot = new WhatsAppBot(config);

    // Agregar comandos personalizados adicionales
    const handler = bot.getHandler();
    
    // Ejemplo: Comando personalizado
    handler.addCommand('hola', async (message, args) => {
        return {
            text: `👋 ¡Hola ${message.pushName}! ¿Cómo estás?`,
            reply: true
        };
    });

    // Ejemplo: Comando con parámetros
    handler.addCommand('dice', async (message, args) => {
        const dice = args[0] || 'un dado';
        return {
            text: `🎲 ${message.pushName} lanzó ${dice}`,
            reply: true
        };
    });

    // Iniciar bot
    try {
        await bot.initialize();
        
        // Mantener el proceso activo
        process.on('beforeExit', () => {
            console.log('Proceso terminando...');
        });
        
    } catch (error) {
        console.error('❌ Error fatal iniciando el bot:', error);
        process.exit(1);
    }
}

// Ejecutar solo si es el archivo principal
if (require.main === module) {
    main();
}

module.exports = WhatsAppBot;