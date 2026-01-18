import { addExif } from '../lib/sticker.js';
import { sticker } from '../lib/sticker.js';
import fetch from 'node-fetch';
import axios from 'axios';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stickerData = false;
  let userId = m.sender;
  let packstickers = global.db.data.users[userId] || {};
  
  let userName = conn.getName(userId);
  let now = new Date();
  let fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  let hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  let texto1 = packstickers.text1 || `🛡️═════ஜ۩۞۩ஜ═════╗\n𝗡 𝗢 𝗠 𝗕𝗥𝗘\n${userName || global.dev || 'Usuario'}`;
  let texto2 = packstickers.text2 || `𝗦𝗘𝗟𝗟𝗢 𝗗𝗘𝗟 𝗛𝗘𝗥𝗢𝗘\n${global.botname || 'Bot'}\n${fecha}\n${hora}\n╚═════ஜ۩۞۩ஜ═════🛡️`;
  
  try {
    if (!m.quoted) {
      return conn.reply(m.chat, 
        `🛡️ Por favor, responde a un sello con el comando *${usedPrefix + command}* seguido del nuevo nombre.\nEjemplo: *${usedPrefix + command} Nuevo Nombre*\nTambién puedes usar: *${usedPrefix + command} texto1•texto2*`, 
        m, global.rcanal
      );
    }

    let q = m.quoted;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    
    if (!/webp/.test(mime) && !q.sticker) {
      return conn.reply(m.chat, '🛡️ Por favor, presenta un sello para modificarlo.', m, global.rcanal);
    }
    
    let buffer = await q.download();
    if (!buffer) {
      return conn.reply(m.chat, '🛡️ La defensa ha fallado: No se pudo obtener el sello.', m, global.rcanal);
    }
    
    await m.react('⚔️');
    
    let txt = args.join(' ');
    let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2];
    
    stickerData = await addExif(buffer, marca[0], marca[1]);
    
  } catch (e) {
    await conn.reply(m.chat, '🛡️ La defensa ha fallado: ' + e.message, m, global.rcanal);
    await m.react('💢');
  } finally {
    if (stickerData) {
      await conn.sendMessage(m.chat, { sticker: stickerData }, { quoted: m });
      await m.react('✅');
    }
  }
};

handler.help = ['wm', 'take', 'robar'];
handler.tags = ['tools', 'sticker'];
handler.command = ['take', 'robar', 'wm'];
handler.register = true;

export default handler;