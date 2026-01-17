import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
let timestamp = speed()
let sentMsg = await conn.reply(m.chat, '🛡️ Evaluando defensas...', m)
let latency = speed() - timestamp
exec(`neofetch --stdout`, (error, stdout, stderr) => {
let child = stdout.toString("utf-8")
let ssd = child.replace(/Memory:/, "Ram:")

let result = `⚔️ ﹒⊹ ๑ ⊹﹒︵ *ESTADO DEL ESCUDO* ︵﹒⊹ ๑ ⊹﹒ ⚔️

> \`🛡️ ¡Contraataque detectado! .ᐟ ֹ ₊ ꒱\`

\`\`\`🛡️ TIEMPO DE DEFENSA 🛡️
﹒⊹ ๑ ⊹﹒︵︵﹒⊹ ๑ ⊹﹒

ⴵ ${latency.toFixed(4).split(".")[0]} ms\`\`\`
${ssd}`
conn.sendMessage(m.chat, { text: result, edit: sentMsg.key }, { quoted: m })
})
}
handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping','p']

export default handler