import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.botNumber = '' 

global.owner = [
  ['573135180876', 'DuarteXV'],
  ['51933000214', 'Ander']
];

global.mods = []
global.suittag = ['573135180876'] 
global.prems = []

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '1.0.0'
global.nameqr = '👑 Michael-Kaiser-MD 👑'
global.namebot = 'MICHAEL KAISER BOT'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 

global.packname = '👑 MICHAEL KAISER BOT 👑'
global.botname = '† MICHAEL KAISER †'
global.dev = 'Powered bye DuarteXv'
global.author = '© DuarteXV'
global.textbot = '👑 Kaiser, el genio absoluto del fútbol alemán.'

global.prefix = '!'

global.isOwner = (sender) => {
  const number = sender.split('@')[0]
  return global.owner.some(owner => owner[0] === number)
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("🔄 settings.js actualizado"))
  import(`${file}?update=${Date.now()}`)
})