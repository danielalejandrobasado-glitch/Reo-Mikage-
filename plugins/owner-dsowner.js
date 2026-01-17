/* Codigo hecho por @Fabri115 y mejorado por BrunoSobrino */

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

var handler = async (m, { conn, usedPrefix }) => {

if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, `🛡️ Este comando solo puede ser utilizado por el Héroe del Escudo.`, m)
}
await conn.reply(m.chat, `🛡️ Preparando el contraataque...`, m)
m.react(rwait)

let sessionPath = `./${sessions}/`

try {

if (!existsSync(sessionPath)) {
return await conn.reply(m.chat, `${emoji} El campo de batalla ya está limpio.`, m)
}
let files = await fs.readdir(sessionPath)
let filesDeleted = 0
for (const file of files) {
if (file !== 'creds.json') {
await fs.unlink(path.join(sessionPath, file))
filesDeleted++;
}
}
if (filesDeleted === 0) {
await conn.reply(m.chat, `${emoji2} No hay amenazas que eliminar.`, m)
} else {
m.react(done)
await conn.reply(m.chat, `> 🛡️ Contraataque completado » ${filesDeleted} vulnerabilidades eliminadas\n> El núcleo de defensa (creds.json) permanece intacto.`, m)
conn.reply(m.chat, `> 🛡️ El escudo protege lo que debe ser protegido...`, m)

}
} catch (err) {
console.error('Error al leer la carpeta o los archivos de sesión:', err);
await conn.reply(m.chat, `${msm} ¡La defensa ha fallado!`, m)
}

}
handler.help = ['dsowner']
handler.tags = ['owner']
handler.command = ['dsowner',]
handler.rowner = true;

export default handler