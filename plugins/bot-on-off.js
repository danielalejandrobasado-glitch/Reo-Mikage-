const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys')

// HANDLER PARA !on
const onHandler = async (m, { conn, args, from, sender, isGroup, isAdmin }) => {
    if (!isGroup) return
    
    const bot = global.reoMikageBot
    
    if (!isAdmin) {
        return await conn.sendMessage(from, { text: '⚠️ *PERMISO DENEGADO*\nSolo administradores pueden activar el bot.' })
    }
    
    const state = bot.groupStates.get(from) || { enabled: true }
    state.enabled = true
    bot.groupStates.set(from, state)
    
    await conn.sendMessage(from, { text: `✅ *REO MIKAGE ACTIVADO*\n\n¡Bot activado en este grupo!\n\nAhora respondo a tus comandos.\nPrefijo: ${bot.prefix}` })
}
onHandler.command = ['on', 'onmiobot']
onHandler.admin = true
onHandler.group = true
onHandler.help = ['!on - Activa el bot en el grupo']
onHandler.tags = ['admin']

// HANDLER PARA !off
const offHandler = async (m, { conn, args, from, sender, isGroup, isAdmin }) => {
    if (!isGroup) return
    
    const bot = global.reoMikageBot
    
    if (!isAdmin) {
        return await conn.sendMessage(from, { text: '⚠️ *PERMISO DENEGADO*\nSolo administradores pueden desactivar el bot.' })
    }
    
    const state = bot.groupStates.get(from) || { enabled: true }
    state.enabled = false
    bot.groupStates.set(from, state)
    
    await conn.sendMessage(from, { text: `🔴 *REO MIKAGE DESACTIVADO*\n\nBot desactivado en este grupo.\n\nUsa *${bot.prefix}on* para volver a activarme.` })
}
offHandler.command = ['off', 'apagar']
offHandler.admin = true
offHandler.group = true
offHandler.help = ['!off - Desactiva el bot en el grupo']
offHandler.tags = ['admin']

// HANDLER PARA !estado
const estadoHandler = async (m, { conn, args, from, isGroup }) => {
    if (!isGroup) return
    
    const bot = global.reoMikageBot
    const state = bot.groupStates.get(from)
    const status = state?.enabled !== false ? 'ACTIVADO ✅' : 'DESACTIVADO 🔴'
    
    await conn.sendMessage(from, { 
        text: `📊 *ESTADO DEL BOT*\n\nGrupo: ${from}\nEstado: ${status}\nPrefijo: ${bot.prefix}\n\nComandos admin:\n• ${bot.prefix}on - Activar bot\n• ${bot.prefix}off - Desactivar bot` 
    })
}
estadoHandler.command = ['estado', 'status', 'state']
estadoHandler.group = true
estadoHandler.help = ['!estado - Muestra el estado del bot']
estadoHandler.tags = ['info']

// CLASE PRINCIPAL DEL BOT
class ReoMikageBot {
    constructor() {
        this.sock = null
        this.prefix = '!'
        this.groupStates = new Map()
        this.handlers = new Map()
        this.loadHandlers()
        global.reoMikageBot = this
    }

    loadHandlers() {
        const handlerList = [onHandler, offHandler, estadoHandler]
        
        handlerList.forEach(handler => {
            const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
            commands.forEach(cmd => {
                this.handlers.set(cmd.toLowerCase(), handler)
            })
        })
    }

    async isGroupAdmin(groupId, userId) {
        try {
            const metadata = await this.sock.groupMetadata(groupId)
            const participant = metadata.participants.find(p => p.id === userId)
            return participant?.admin === 'admin' || participant?.admin === 'superadmin'
        } catch {
            return false
        }
    }

    isBotEnabled(groupId) {
        const state = this.groupStates.get(groupId)
        return state?.enabled !== false
    }

    async handleMessage(m) {
        const msg = m.messages[0]
        if (!msg.message) return
        
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        
        if (!text.startsWith(this.prefix)) return
        
        const from = msg.key.remoteJid
        const sender = msg.key.participant || from
        const isGroup = from.endsWith('@g.us')
        
        const args = text.slice(this.prefix.length).trim().split(/ +/)
        const cmd = args.shift().toLowerCase()
        
        const handler = this.handlers.get(cmd)
        if (!handler) return
        
        if (handler.group && !isGroup) return
        
        const isAdmin = await this.isGroupAdmin(from, sender)
        
        if (handler.admin && !isAdmin) {
            return await this.sock.sendMessage(from, { 
                text: '⚠️ *PERMISO DENEGADO*\nSolo administradores pueden usar este comando.' 
            })
        }
        
        if (cmd !== 'on' && cmd !== 'onmiobot' && cmd !== 'off' && cmd !== 'apagar') {
            if (!this.isBotEnabled(from) && isGroup) {
                return await this.sock.sendMessage(from, { 
                    text: `🔴 El bot está desactivado en este grupo.\nUsa *${this.prefix}on* para activarlo.` 
                })
            }
        }
        
        try {
            await handler(m, {
                conn: this.sock,
                args: args,
                from: from,
                sender: sender,
                isGroup: isGroup,
                isAdmin: isAdmin
            })
        } catch (error) {
            console.log('Error en handler:', error)
        }
    }

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState('session')
        
        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: { level: 'silent' }
        })
        
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            if (connection === 'close') {
                console.log('🔌 Reconectando...')
                setTimeout(() => this.start(), 3000)
            }
            if (connection === 'open') {
                console.log('✅ Reo Mikage conectado')
                console.log('📋 Handlers cargados:')
                this.handlers.forEach((handler, cmd) => {
                    console.log(`  !${cmd} - ${handler.help[0]}`)
                })
            }
        })
        
        this.sock.ev.on('messages.upsert', async (m) => {
            await this.handleMessage(m)
        })
        
        this.sock.ev.on('creds.update', saveCreds)
    }
}

const bot = new ReoMikageBot()
bot.start().catch(console.error)