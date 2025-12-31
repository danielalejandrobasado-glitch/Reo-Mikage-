/**
 * Módulo Handler para manejar comandos y eventos del bot de WhatsApp
 * Este archivo gestiona la lógica de comandos de manera modular y extensible
 */

class Handler {
    /**
     * Constructor del Handler
     * @param {Object} options - Opciones de configuración
     * @param {string} options.prefix - Prefijo para comandos (ej: '!', '/')
     * @param {Object} options.socket - Conexión de WhatsApp (opcional)
     */
    constructor(options = {}) {
        this.prefix = options.prefix || '!';
        this.socket = options.socket || null;
        
        // Almacena comandos en un Map para mejor rendimiento
        this.commands = new Map();
        
        // Almacena listeners de eventos
        this.eventListeners = new Map();
        
        // Inicializar comandos por defecto
        this._initializeDefaultCommands();
        
        // Inicializar listeners por defecto
        this._initializeDefaultListeners();
    }

    /**
     * Inicializa comandos básicos por defecto
     * @private
     */
    _initializeDefaultCommands() {
        // Comando ping-pong básico
        this.addCommand('ping', async (message, args) => {
            return {
                text: '🏓 Pong!',
                reply: true
            };
        });

        // Comando de ayuda
        this.addCommand('help', async (message, args) => {
            const commandsList = Array.from(this.commands.keys())
                .map(cmd => `▫ ${this.prefix}${cmd}`)
                .join('\n');
            
            return {
                text: `📚 *COMANDOS DISPONIBLES:*\n\n${commandsList}\n\n_Prefijo: ${this.prefix}_`,
                reply: true
            };
        });

        // Comando de información
        this.addCommand('info', async (message, args) => {
            return {
                text: `🤖 *BOT INFORMATION*\n\n` +
                      `• Handler: v1.0.0\n` +
                      `• Prefijo: ${this.prefix}\n` +
                      `• Comandos: ${this.commands.size}\n` +
                      `• Estado: ✅ Operativo`,
                reply: true
            };
        });
    }

    /**
     * Inicializa listeners por defecto
     * @private
     */
    _initializeDefaultListeners() {
        // Listener para mensajes (puede ser sobrescrito)
        this.addEventListener('message', async (message) => {
            console.log(`📩 Mensaje recibido de ${message.sender}: ${message.body}`);
        });

        // Listener para conexión
        this.addEventListener('connection', (status) => {
            console.log(`🔗 Estado de conexión: ${status}`);
        });
    }

    /**
     * Añade un nuevo comando al handler
     * @param {string} name - Nombre del comando (sin prefijo)
     * @param {Function} callback - Función que ejecuta el comando
     * @returns {boolean} - True si se añadió correctamente
     */
    addCommand(name, callback) {
        if (typeof callback !== 'function') {
            throw new Error('El callback debe ser una función');
        }
        
        this.commands.set(name.toLowerCase(), callback);
        console.log(`✅ Comando '${this.prefix}${name}' registrado`);
        return true;
    }

    /**
     * Elimina un comando existente
     * @param {string} name - Nombre del comando
     * @returns {boolean} - True si se eliminó correctamente
     */
    removeCommand(name) {
        return this.commands.delete(name.toLowerCase());
    }

    /**
     * Obtiene la función de un comando específico
     * @param {string} name - Nombre del comando
     * @returns {Function|null} - Función del comando o null si no existe
     */
    getCommand(name) {
        return this.commands.get(name.toLowerCase()) || null;
    }

    /**
     * Añade un listener para eventos
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función callback
     */
    addEventListener(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    /**
     * Elimina un listener específico
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función callback a eliminar
     */
    removeEventListener(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            const listeners = this.eventListeners.get(eventName);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Ejecuta todos los listeners de un evento
     * @param {string} eventName - Nombre del evento
     * @param {*} data - Datos para pasar a los listeners
     */
    emitEvent(eventName, data) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error en listener '${eventName}':`, error);
                }
            });
        }
    }

    /**
     * Procesa un mensaje y ejecuta el comando correspondiente
     * @param {Object} message - Objeto del mensaje recibido
     * @param {string} message.body - Texto del mensaje
     * @param {string} message.sender - Remitente del mensaje
     * @param {Object} message.chat - Información del chat
     * @returns {Promise<Object|null>} - Respuesta del comando o null si no es un comando
     */
    async processMessage(message) {
        // Emitir evento de mensaje recibido
        this.emitEvent('message', message);

        // Verificar si el mensaje comienza con el prefijo
        if (!message.body || !message.body.startsWith(this.prefix)) {
            return null;
        }

        // Extraer comando y argumentos
        const args = message.body.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Buscar el comando
        const command = this.getCommand(commandName);
        if (!command) {
            return {
                text: `❌ Comando '${this.prefix}${commandName}' no encontrado.\n` +
                      `Usa ${this.prefix}help para ver los comandos disponibles.`,
                reply: true
            };
        }

        try {
            console.log(`⚡ Ejecutando comando: ${this.prefix}${commandName}`);
            
            // Ejecutar el comando
            const result = await command(message, args);
            
            if (result && result.text) {
                return {
                    ...result,
                    chatId: message.chat.id || message.from,
                    sender: message.sender
                };
            }
            
            return result;
        } catch (error) {
            console.error(`Error ejecutando comando '${commandName}':`, error);
            return {
                text: `❌ Error ejecutando el comando: ${error.message}`,
                reply: true
            };
        }
    }

    /**
     * Establece la conexión de WhatsApp
     * @param {Object} socket - Socket de Baileys
     */
    setSocket(socket) {
        this.socket = socket;
    }

    /**
     * Obtiene la lista de comandos disponibles
     * @returns {Array} - Lista de nombres de comandos
     */
    getCommandList() {
        return Array.from(this.commands.keys());
    }

    /**
     * Obtiene el número total de comandos
     * @returns {number} - Cantidad de comandos
     */
    getCommandCount() {
        return this.commands.size;
    }
}

module.exports = Handler;