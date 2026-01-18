import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {

    await m.react('👋');

    // Número del creador del bot (Colombia)
    let creatorNumber = '573135180876';
    // Número del administrador del bot (México) - Asegurado formato correcto
    let adminNumber = '526679796825';

    // Verificar que el número mexicano esté en formato correcto
    console.log('Número admin (México):', adminNumber);
    
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

    // Verificar que se genera correctamente
    console.log('VCard Admin generada:', vcardAdmin);
    
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
    
    // Mensaje de confirmación
    m.reply(`⚛ Contactos del bot enviados:\n👑 Creador: +57 313 518 0876\n⚛ Administrador: +52 667 979 6825`);
}

handler.help = ["owner", "creador", "dueño", "admin", "administrador"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño', 'admin', 'administrador'];

export default handler;