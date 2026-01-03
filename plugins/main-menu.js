import fetch from 'node-fetch'

const channelId = '120363423258391692@newsletter'
const channelName = '⏤͟͞ू⃪𝐁𝕃𝐔𝔼 𝐋𝕆𝐂𝕂 𝐂𝕃𝐔𝔅 𑁯🩵ᰍ'
const michaelGif = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767403265037.gif'

let handler = async (m, { conn }) => {
  let mentionedJid = m.mentionedJid
  let userId = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.sender
  let name = conn.getName(userId)
  let totalreg = Object.keys(global.db.data.users).length
  const uptime = clockString(process.uptime() * 1000)

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

  await conn.sendMessage(m.chat, {
    text: txt,
    contextInfo: {
      mentionedJid: [m.sender, userId],
      forwardingScore: 1,
      externalAdReply: {
        title: `☆𝑀𝑖𝑐ℎ𝑎𝑒𝑙 𝐾𝑎𝑖𝑠𝑒𝑟☆`,
        body: channelName,
        thumbnailUrl: michaelGif,
        sourceUrl: 'https://whatsapp.com/channel/0029VaW7y8RBP38KTUzNYN1t',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  }, { quoted: m })
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