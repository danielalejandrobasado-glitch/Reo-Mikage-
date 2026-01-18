import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.botNumber = '' 

global.owner = [
  ['573135180876', 'DuarteXV'],
  ['51933000214', 'Ander'],
  ['573229506110', 'Naofumi']
];

global.mods = []
global.suittag = ['573135180876'] 
global.prems = []

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '1.0.0'
global.nameqr = '🛡️ Naofumi-MD 🛡️'
global.namebot = 'NAOFUMI BOT'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 

global.packname = '🛡️ NAOFUMI BOT 🛡️'
global.botname = '† NAOFUMI IWATANI †'
global.dev = 'Powered by DuarteXv'
global.author = '© DuarteXV'
global.textbot = '🛡️ Naofumi Iwatani, el Héroe del Escudo.'
global.banner = 'https://cdn.hostrta.win/fl/39kd.jpg'
global.prefix = '!'
global.welcom1 = 'Bienvenido a la comunidad'
global.emoji = '📜'
global.emoji2 = '⚛'
global.emoji3 = '🛡'
global.ownerNumbers = ['573135180876', '51933000214', '573229506110'].map(v => v + '@s.whatsapp.net')

global.ch = {
   ch1: '120363420979328566@newsletter',
}

global.isOwner = (sender) => {
  const number = sender.replace('@s.whatsapp.net', '')
  return global.owner.some(owner => owner[0] === number) || 
         global.creador?.some(creator => creator.replace('@s.whatsapp.net', '') === number)
}

global.isCreator = (sender) => {
  const number = sender.replace('@s.whatsapp.net', '')
  return global.creador?.some(creator => creator.replace('@s.whatsapp.net', '') === number)
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("🔄 settings.js actualizado"))
  import(`${file}?update=${Date.now()}`)
})