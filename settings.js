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
global.nameqr = '👑 Reo-Mikage-MD 👑'
global.namebot = 'REO MIKAGE BOT'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 

global.packname = '👑 REO MIKAGE BOT 👑'
global.botname = '† REO MIKAGE †'
global.dev = 'Powered by DuarteXv'
global.author = '© DuarteXV'
global.textbot = '👑 Mikage, el prodigio absoluto del fútbol japonés.'
global.banner = 'https://qu.ax/NV9Db'
global.prefix = '!'


global.owner = ['573135180876', '51933000214'].map(v => v + '@s.whatsapp.net')


global.isOwner = (sender) => {
  const number = sender.replace('@s.whatsapp.net', '')
  return global.owner.some(owner => owner[0] === number) || 
         global.creador.some(creator => creator.replace('@s.whatsapp.net', '') === number)
}


global.isCreator = (sender) => {
  const number = sender.replace('@s.whatsapp.net', '')
  return global.creador.some(creator => creator.replace('@s.whatsapp.net', '') === number)
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("🔄 settings.js actualizado"))
  import(`${file}?update=${Date.now()}`)
})