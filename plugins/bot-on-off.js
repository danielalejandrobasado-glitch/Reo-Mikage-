const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys')
const fs = require('fs')

// HANDLER ON
const onHandler = async (m, { conn, from, sender, isAdmin }) => {
    if (!isAdmin) {
        return await conn.sendMessage(from, { text: '⚠️ Solo administradores pueden activar el bot.' })
    }
    
    global.botStates = global.botStates || {}
    global.botStates[from] = { enabled: true }
    
    await conn.sendMessage(from, { text: '✅ *BOT ACTIVADO*' })
}
onHandler.command = ['on', 'onmiobot']
onHandler.admin = true
onHandler.group = true

// HANDLER OFF
const offHandler = async (m, { conn, from, sender, isAdmin }) => {
    if (!isAdmin) {
        return await conn.sendMessage(from, { text: '⚠️ Solo administradores pueden desactivar el bot.' })
    }
    
    global.botStates = global.botStates || {}
    global.botStates[from] = { enabled: false }
    
    await conn.sendMessage(from, { text: '🔴 *BOT DESACTIVADO*' })
}
offHandler.command = ['off', 'apagar']
offHandler.admin = true
offHandler.group = true

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: { level: 'silent' }
    })
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            console.log('Reconectando...')
            setTimeout(startBot, 3000)
        }
        if (connection === 'open') {
            console.log('Bot conectado')
        }
    })
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        if (!text.startsWith('!')) return
        
        const from = msg.key.remoteJid
        const sender = msg.key.participant || from
        const isGroup = from.endsWith('@g.us')
        
        const args = text.slice(1).trim().split(/ +/)
        const cmd = args.shift().toLowerCase()
        
        // Verificar si es admin
        let isAdmin = false
        if (isGroup) {
            try {
                const metadata = await sock.groupMetadata(from)
                const participant = metadata.participants.find(p => p.id === sender)
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
            } catch (e) {}
        }
        
        // Buscar handler
        let handler = null
        if (cmd === 'on' || cmd === 'onmiobot') handler = onHandler
        else if (cmd === 'off' || cmd === 'apagar') handler = offHandler
        
        if (!handler) return
        
        // Verificar si es grupo
        if (handler.group && !isGroup) return
        
        // Verificar admin
        if (handler.admin && !isAdmin) {
            return await sock.sendMessage(from, { text: '⚠️ Solo administradores pueden usar este comando.' })
        }
        
        // Ejecutar handler
        try {
            await handler(m, {
                conn: sock,
                from,
                sender,
                isAdmin
            })
        } catch (error) {
            console.log(error)
        }
    })
    
    sock.ev.on('creds.update', saveCreds)
}

startBot()