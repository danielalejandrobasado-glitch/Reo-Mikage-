import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn, usedPrefix }) => {
    await m.react('👋');
    
    let mensaje = `*⚛ CONTACTOS DEL BOT ⚛*\n\n`
    
    let botones = [
        { buttonId: `${usedPrefix}creador`, buttonText: { displayText: '👑 CREADOR' }, type: 1 },
        { buttonId: `${usedPrefix}admin`, buttonText: { displayText: '⚛ ADMIN' }, type: 1 }
    ]
    
    let botonera = {
        text: mensaje,
        footer: 'Selecciona una opción para contactar:',
        buttons: botones,
        headerType: 1
    }
    
    await conn.sendMessage(m.chat, botonera, { quoted: m })
}

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño', 'contactos'];

// Handler para el botón CREADOR
let handlerCreator = async (m, { conn }) => {
    let creatorNumber = '573135180876';
    let creatorFormatted = PhoneNumber('+' + creatorNumber).getNumber('international');
    
    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Creador del Bot
TEL;waid=${creatorNumber}:${creatorFormatted}
END:VCARD`.trim();
    
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: '👑 Creador',
            contacts: [{ vcard }]
        }
    }, { quoted: m });
}

// Handler para el botón ADMIN
let handlerAdmin = async (m, { conn }) => {
    let adminNumber = '526679796825';
    let adminFormatted = PhoneNumber('+' + adminNumber).getNumber('international');
    
    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:⚛ Administrador del Bot
TEL;waid=${adminNumber}:${adminFormatted}
END:VCARD`.trim();
    
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: '⚛ Administrador',
            contacts: [{ vcard }]
        }
    }, { quoted: m });
}

// Command handlers para los botones
handlerCreator.command = ['creador'];
handlerAdmin.command = ['admin'];

export default handler;
export { handlerCreator, handlerAdmin };