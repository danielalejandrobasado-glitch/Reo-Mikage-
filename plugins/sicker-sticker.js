import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
let stiker = false
let userId = m.sender
let packstickers = global.db.data.users[userId] || {}

let userName = conn.getName(userId)
let now = new Date()
let fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
let hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

let texto1 = packstickers.text1 || `🛡️═════ஜ۩۞۩ஜ═════╗\n𝗡 𝗢 𝗠 𝗕𝗥𝗘\n${userName || dev}`
let texto2 = packstickers.text2 || `𝗦𝗘𝗟𝗟𝗢 𝗗𝗘𝗟 𝗛𝗘𝗥𝗢𝗘\n${botname}\n${fecha}\n${hora}\n╚═════ஜ۩۞۩ஜ═════🛡️`

try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
let txt = args.join(' ')

if (/webp|image|video/g.test(mime) && q.download) {
if (/video/.test(mime) && (q.msg || q).seconds > 16)
return conn.reply(m.chat, '🛡️ El registro de batalla no debe superar *15 segundos*', m, global.rcanal)
let buffer = await q.download()
await m.react('⚔️')

let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
stiker = await sticker(buffer, false, marca[0], marca[1])
} else if (args[0] && isUrl(args[0])) {
let buffer = await sticker(false, args[0], texto1, texto2)
stiker = buffer
} else {
return conn.reply(m.chat, '🛡️ Por favor, presenta una imagen o registro visual para convertirlo en sello del héroe.', m, global.rcanal)
}} catch (e) {
await conn.reply(m.chat, '🛡️ La defensa ha fallado: ' + e.message, m, global.rcanal)
await m.react('💢')
} finally {
if (stiker) {
conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
await m.react('✅')
}}}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'sellobatalla']

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}