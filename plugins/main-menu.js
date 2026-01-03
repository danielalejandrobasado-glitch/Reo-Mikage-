import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

// Cache del GIF para evitar descargas repetidas
let cachedGif = null
let gifBuffer = null

const downloadGif = async (url) => {
  try {
    if (gifBuffer) return gifBuffer // Retornar cache si existe
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al descargar GIF')
    
    gifBuffer = await response.buffer()
    return gifBuffer
  } catch (error) {
    console.error('Error descargando GIF:', error)
    return null
  }
}

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let name = conn.getName(userId)
  let totalreg = Object.keys(global.db.data.users).length
  const uptime = clockString(process.uptime() * 1000)
  const michaelGif = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767403265037.gif'
  
  let txt = `
> Hola @${userId.split('@')[0]}, mi nombre es ${botname} ⸜(。˃ ᴗ ˂ )⸝♡
✧˖°⊹ ─────────────── ⊹°˖✧
˚ ♡ ⋆｡˚ Tipo ⟢ ${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-bot')}
˚ ♡ ⋆｡˚ Activo ⟢ ${uptime}
˚ ♡ ⋆｡˚ Usuarios ⟢ ${totalreg}
˚ ♡ ⋆｡˚ Biblioteca ⟢ Baileys
✧˖°⊹ ─────────────── ⊹°˖✧
☆𝑀𝑖𝑐ℎ𝑎𝑒𝑙 𝐾𝑎𝑖𝑠𝑒𝑟☆
𖤐 /ping
𖤐 /sticker
✧˖°⊹ ─────────────── ⊹°˖✧
`.trim()

  try {

    const gif = await downloadGif(michaelGif)
    
    if (gif) {

      await conn.sendMessage(m.chat, {
        video: gif,
        gifPlayback: true,
        caption: txt,
        contextInfo: {
          mentionedJid: [m.sender, userId].filter(v => v)
        }
      }, { quoted: m })
    } else {

      await m.reply(txt)
    }
  } catch (error) {
    console.error('Error enviando menú:', error)

    await m.reply(txt)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'menucompleto', 'comandos', 'helpcompleto', 'allmenu']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}