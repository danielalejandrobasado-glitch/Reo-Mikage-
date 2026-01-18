import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {
    await m.react('👋');
    
    let creatorNumber = '573135180876'; // Colombia
    let adminNumber = '526679796825'; // México
    
    let creatorFormatted = PhoneNumber('+' + creatorNumber).getNumber('international');
    let adminFormatted = PhoneNumber('+' + adminNumber).getNumber('international');
    
    let mensaje = `*⚛ CONTACTOS DEL BOT ⚛*\n\n`
    
    let botones = [
        { buttonId: `${usedPrefix}owner`, buttonText: { displayText: '👑 CREADOR' }, type: 1 },
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

// Handler para botón 1: Creador
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

// Handler para botón 2: Administrador
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

// Exportar handlers
export { handlerCreator, handlerAdmin };
export default handler;