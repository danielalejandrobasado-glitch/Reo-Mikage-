import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {

    await m.react('👋');

    let creatorNumber = '573135180876'; // Colombia
    let adminNumber = '526679796825'; // México


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


    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: '⚛ Contactos del Bot',
            contacts: [{ vcard: vcardCreator }, { vcard: vcardAdmin }]
        }
    }, { quoted: m });
    
    m.reply(`⚛ Contactos enviados:\n👑 Creador: +57 313 518 0876\n⚛ Admin: +52 667 979 6825`);
}

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño'];

export default handler;