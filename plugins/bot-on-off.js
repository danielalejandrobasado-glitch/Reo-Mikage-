import { makeWASocket, useMultiFileAuthState } from '@adiwajshing/baileys'

class ReoMikageBot {
    constructor() {
        this.sock = null
        this.prefix = '!'
        this.developer = '521234567890@s.whatsapp.net' // CAMBIA ESTO
        this.groupStates = new Map() // { grupoId: { enabled: true/false } }
    }

    // SISTEMA DE HANDLERS
    handlers = {
        // HANDLER PARA !on
        on: {
            execute: async (m, { conn, args, from, sender, isGroup }) => {
                if (!isGroup) return
                
                // Verificar si es admin
                const isAdmin = await this.isGroupAdmin(from, sender)
                if (!isAdmin && sender !== this.developer) {
                    return await conn.sendMessage(from, {
                        text: '⚠️ *PERMISO DENEGADO*\nSolo administradores pueden activar el bot.'
                    })
                }

                // Activar en este grupo
                this.groupStates.set(from, { enabled: true })
                
                await conn.sendMessage(from, {
                    text: `✅ *REO MIKAGE ACTIVADO*\n\n¡Bot activado en este grupo!\n\nAhora respondo a tus comandos.\nPrefijo: ${this.prefix}`
                })
            },
            command: ['on', 'onmiobot'],
            admin: true,
            group: true,
            help: '!on - Activa el bot en el grupo'
        },

        // HANDLER PARA !off
        off: {
            execute: async (m, { conn, args, from, sender, isGroup }) => {
                if (!isGroup) return
                
                // Verificar si es admin
                const isAdmin = await this.isGroupAdmin(from, sender)
                if (!isAdmin && sender !== this.developer) {
                    return await conn.sendMessage(from, {
                        text: '⚠️ *PERMISO DENEGADO*\nSolo administradores pueden desactivar el bot.'
                    })
                }

                // Desactivar en este grupo
                this.groupStates.set(from, { enabled: false })
                
                await conn.sendMessage(from, {
                    text: `🔴 *REO MIKAGE DESACTIVADO*\n\nBot desactivado en este grupo.\n\nUsa *${this.prefix}on* para volver a activarme.`
                })
            },
            command: ['off', 'apagar'],
            admin: true,
            group: true,
            help: '!off - Desactiva el bot en el grupo'
        },

        // HANDLER PARA !estado
        estado: {
            execute: async (m, { conn, from, isGroup }) => {
                if (!isGroup) return
                
                const state = this.groupStates.get(from)
                const status = state?.enabled ? 'ACTIVADO ✅' : 'DESACTIVADO 🔴'
                
                await conn.sendMessage(from, {
                    text: `📊 *ESTADO DEL BOT*\n\nGrupo: ${from}\nEstado: ${status}\nPrefijo: ${this.prefix}\n\nComandos admin:\n• ${this.prefix}on - Activar bot\n• ${this.prefix}off - Desactivar bot`
                })
            },
            command: ['estado', 'status', 'state'],
            group: true,
            help: '!estado - Muestra el estado del bot'
        }
    }

    // Verificar si es admin del grupo
    async isGroupAdmin(groupId, userId) {
        try {
            const metadata = await this.sock.groupMetadata(groupId)
            const participant = metadata.participants.find(p => p.id === userId)
            return participant?.admin === 'admin' || participant?.admin === 'superadmin'
        } catch {
            return false
        }
    }

    // Verificar si el bot está activo en el grupo
    isBotEnabled(groupId) {
        const state = this.groupStates.get(groupId)
        // Por defecto, el bot está activo en todos los grupos
        return state ? state.enabled : true
    }

    // Procesar mensajes
    async handleMessage(m) {
        const msg = m.messages[0]
        if (!msg.message) return
        
        const text = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || ''
        
        if (!text.startsWith(this.prefix)) return
        
        const from = msg.key.remoteJid
        const sender = msg.key.participant || from
        const isGroup = from.endsWith('@g.us')
        
        // Extraer comando
        const args = text.slice(this.prefix.length).trim().split(/ +/)
        const cmd = args.shift().toLowerCase()
        
        // Buscar handler
        let handler = null
        let handlerName = null
        
        for (const [name, h] of Object.entries(this.handlers)) {
            if (h.command.includes(cmd)) {
                handler = h
                handlerName = name
                break
            }
        }
        
        if (!handler) {
            // Comando no encontrado
            if (this.isBotEnabled(from) && isGroup) {
                await this.sock.sendMessage(from, {
                    text: `❌ Comando no encontrado: ${this.prefix}${cmd}\n\nComandos disponibles:\n• ${this.prefix}on - Activar bot\n• ${this.prefix}off - Desactivar bot\n• ${this.prefix}estado - Ver estado`
                })
            }
            return
        }
        
        // Verificar si es grupo (si el handler requiere grupo)
        if (handler.group && !isGroup) return
        
        // Verificar si el bot está activo (excepto para on/off)
        if (handlerName !== 'on' && handlerName !== 'off' && !this.isBotEnabled(from) && isGroup) {
            return await this.sock.sendMessage(from, {
                text: `🔴 El bot está desactivado en este grupo.\nUsa *${this.prefix}on* para activarlo.`
            })
        }
        
        // Ejecutar handler
        try {
            await handler.execute(m, {
                conn: this.sock,
                args,
                from,
                sender,
                isGroup,
                isAdmin: await this.isGroupAdmin(from, sender),
                isOwner: sender === this.developer
            })
        } catch (error) {
            console.log('Error en handler:', error)
        }
    }

    // Iniciar bot
    async start() {
        const { state, saveCreds } = await useMultiFileAuthState('session')
        
        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: { level: 'silent' }
        })
        
        // Manejar conexión
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            if (connection === 'close') {
                console.log('🔌 Reconectando...')
                setTimeout(() => this.start(), 3000)
            }
            if (connection === 'open') {
                console.log('✅ Reo Mikage conectado')
                console.log('🤖 Comandos disponibles:')
                Object.values(this.handlers).forEach(h => {
                    console.log(`  ${h.command.join(', ')} - ${h.help}`)
                })
            }
        })
        
        // Manejar mensajes
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessage(m)
        })
        
        // Guardar credenciales
        this.sock.ev.on('creds.update', saveCreds)
    }
}

// EJECUTAR BOT
const bot = new ReoMikageBot()

// IMPORTANTE: CAMBIA ESTE NÚMERO
bot.developer = '521234567890@s.whatsapp.net' // TU NÚMERO CON CÓDIGO DE PAÍS

bot.start().catch(console.error)

// Para agregar más handlers simplemente agregas al objeto handlers:
/*
    // EJEMPLO PARA AGREGAR MÁS COMANDOS:
    miComando: {
        execute: async (m, { conn, args, from }) => {
            await conn.sendMessage(from, { text: 'Hola desde mi comando' })
        },
        command: ['comando', 'cmd'],
        group: true, // opcional
        admin: false, // opcional
        help: '!comando - Descripción'
    }
*/