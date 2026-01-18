import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {

    await m.react('👋');

    // Número del creador del bot (Colombia)
    let creatorNumber = '573135180876';
    // Número del administrador del bot (México)
    let adminNumber = '526679796825';

    let vcardCreator = `
BEGIN:VCARD
VERSION:3.0
FN:👑 Creador del Bot
TEL;waid=${creatorNumber}:${PhoneNumber('+' + creatorNumber).getNumber('international')}
END:VCARD`.trim();

    let vcardAdmin = `
BEGIN:VCARD
VERSION:3.0
FN:⚛ Administrador del Bot
TEL;waid=${adminNumber}:${PhoneNumber('+' + adminNumber).getNumber('international')}
END:VCARD`.trim();

    // Enviar ambos contactos
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: 'Contactos del Bot',
            contacts: [
                { vcard: vcardCreator },
                { vcard: vcardAdmin }
            ]
        }
    }, { quoted: m });
}

handler.help = ["owner", "creador", "dueño", "admin", "administrador"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño', 'admin', 'administrador'];

export default handler;