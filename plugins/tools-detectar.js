import fs from 'fs'
import path from 'path'

var handler = async (m, { usedPrefix, command }) => {
    try {
        await m.react('🛡️') 
        conn.sendPresenceUpdate('composing', m.chat)

        const pluginsDir = './plugins'

        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

        let response = `🛡️ *Inspección del Escudo de la Ira:*\n\n`
        let threatsDetected = false

        for (const file of files) {
            try {
                await import(path.resolve(pluginsDir, file))
            } catch (error) {
                threatsDetected = true
                const stackLines = error.stack.split('\n')

                const errorLineMatch = stackLines[0].match(/:(\d+):\d+/) 
                const errorLine = errorLineMatch ? errorLineMatch[1] : 'Desconocido'

                response += `⚔️ *Amenaza neutralizada en:* ${file}\n\n> ● Vulnerabilidad: ${error.message}\n> ● Punto débil (línea): ${errorLine}\n\n`
            }
        }

        if (!threatsDetected) {
            response += '🛡️ ¡El reino está seguro! No se encontraron vulnerabilidades en las defensas'
        }

        await conn.reply(m.chat, response, m)
        await m.react('✅')
    } catch (err) {
        await m.react('💢') 
        await conn.reply(m.chat, `🛡️ ¡Defensa fallida!: ${err.message}`, m)
    }
}

handler.command = ['inspeccionar', 'detectar']
handler.help = ['inspeccionar']
handler.tags = ['tools']
handler.rowner = true

export default handler