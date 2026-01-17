import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import { watchFile } from 'fs';

const terminalImage = global.opts['img'] ? require('terminal-image') : '';
const urlRegex = (await import('url-regex-safe')).default({ strict: false });

export default async function (m, conn = { user: {} }) {
    if (m.mtype && m.mtype.includes('buttonsResponseMessage')) return;

    let _name = await conn.getName(m.sender);
    let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '');
    let chat = await conn.getName(m.chat);
    let img;
    try {
        if (global.opts['img']) {
            img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false;
        }
    } catch (e) {
        console.error(e);
    }
    let filesize = (m.msg ?
        m.msg.vcard ?
            m.msg.vcard.length :
            m.msg.fileLength ?
                m.msg.fileLength.low || m.msg.fileLength :
                m.msg.axolotlSenderKeyDistributionMessage ?
                    m.msg.axolotlSenderKeyDistributionMessage.length :
                    m.text ?
                        m.text.length :
                        0
            : m.text ? m.text.length : 0) || 0;
    let user = global.db.data.users[m.sender];
    let me = PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international');

    // Formato de hora más estético
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });
    const dateString = now.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Iconos para diferentes tipos
    const icons = {
        message: '💬',
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        ptt: '🎤',
        document: '📄',
        sticker: '✨',
        contact: '👤',
        location: '📍',
        group: '👥',
        private: '🔒'
    };

    // Determinar tipo de mensaje con icono
    let messageType = m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Message';
    let messageIcon = icons[m.mtype?.replace(/message$/i, '')] || icons.message;

    // Formato de tamaño de archivo
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Encabezado estético
    console.log(
        chalk.cyan('╔' + '═'.repeat(60) + '╗')
    );
    
    console.log(
        chalk.cyan('║') + 
        chalk.bold.cyan(' 📱 BOT LOGGER ') + 
        chalk.gray(' | ') + 
        chalk.yellow(dateString) + 
        chalk.gray(' | ') + 
        chalk.green(timeString) + 
        chalk.cyan('║').padEnd(61)
    );

    console.log(
        chalk.cyan('╠' + '─'.repeat(60) + '╣')
    );

    // Información del bot
    console.log(
        chalk.cyan('║') + 
        chalk.white.bold(' 🤖 BOT: ') + 
        chalk.cyan(me + ' ~' + conn.user.name) + 
        chalk.cyan('║').padEnd(61)
    );

    // Separador
    console.log(
        chalk.cyan('╠' + '┄'.repeat(60) + '╣')
    );

    // Información del remitente
    console.log(
        chalk.cyan('║') + 
        chalk.white.bold(' 📤 FROM: ') + 
        chalk.magenta(sender) + 
        chalk.cyan('║').padEnd(61)
    );

    // Información del chat
    let chatType = m.isGroup ? `${icons.group} Grupo` : `${icons.private} Privado`;
    console.log(
        chalk.cyan('║') + 
        chalk.white.bold(' 💬 CHAT: ') + 
        chalk.blueBright(chat || 'Desconocido') + 
        chalk.gray(' | ') + 
        chalk.yellow(chatType) + 
        chalk.cyan('║').padEnd(61)
    );

    // Tipo de mensaje y tamaño
    console.log(
        chalk.cyan('║') + 
        chalk.white.bold(' 🏷️  TYPE: ') + 
        chalk.cyan(messageIcon + ' ' + messageType) + 
        chalk.gray(' | ') + 
        chalk.white.bold('📏 SIZE: ') + 
        chalk.yellow(formatFileSize(filesize)) + 
        chalk.cyan('║').padEnd(61)
    );

    // Información del usuario
    if (user) {
        console.log(
            chalk.cyan('║') + 
            chalk.white.bold(' ⭐ USER: ') + 
            chalk.green(`Level ${user.level}`) + 
            chalk.gray(' | ') + 
            chalk.magenta(`XP: ${user.exp}`) + 
            chalk.gray(' | ') + 
            chalk.cyan(`Limit: ${user.limit}`) + 
            chalk.cyan('║').padEnd(61)
        );
    }

    console.log(
        chalk.cyan('╠' + '─'.repeat(60) + '╣')
    );

    // Contenido del mensaje
    console.log(
        chalk.cyan('║') + 
        chalk.white.bold(' 📝 CONTENT:') + 
        chalk.cyan('║').padEnd(61)
    );

    // Mostrar imagen si existe
    if (img) {
        console.log(
            chalk.cyan('║ ') + 
            img.trimEnd().split('\n').map(line => line + ' '.repeat(58 - line.length) + chalk.cyan('║')).join('\n' + chalk.cyan('║ '))
        );
    }

    // Texto del mensaje
    if (typeof m.text === 'string' && m.text) {
        let log = m.text.replace(/\u200e+/g, '');
        let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g;
        let mdFormat = (depth = 4) => (_, type, text, monospace) => {
            let types = {
                _: 'italic',
                '*': 'bold',
                '~': 'strikethrough'
            };
            text = text || monospace;
            let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)));
            return formatted;
        };
        
        if (log.length < 4096) {
            log = log.replace(urlRegex, (url, i, text) => {
                let end = url.length + i;
                return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.cyan.underline(url) : url;
            });
        }
        
        log = log.replace(mdRegex, mdFormat(4));
        
        if (m.mentionedJid) {
            for (let user of m.mentionedJid) {
                log = log.replace('@' + user.split`@`[0], chalk.magenta.bold('@' + await conn.getName(user)));
            }
        }

        // Formatear texto con recuadro
        const textLines = m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow.bold('⚡ ' + log) : chalk.white(log);
        
        // Dividir texto en líneas para el recuadro
        const wrapText = (text, maxLength) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            words.forEach(word => {
                if ((currentLine + word).length <= maxLength) {
                    currentLine += (currentLine ? ' ' : '') + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            });
            
            if (currentLine) lines.push(currentLine);
            return lines;
        };

        const wrappedLines = wrapText(textLines, 56);
        
        wrappedLines.forEach(line => {
            console.log(
                chalk.cyan('║ ') + 
                line + 
                ' '.repeat(58 - line.replace(/\x1b\[[0-9;]*m/g, '').length) + 
                chalk.cyan('║')
            );
        });
    }

    // Mensajes especiales (stub parameters)
    if (m.messageStubParameters) {
        console.log(
            chalk.cyan('║') + 
            chalk.gray.bold(' 🔄 ACTION: ') + 
            chalk.cyan('║').padEnd(61)
        );
        
        const params = m.messageStubParameters.map(jid => {
            jid = conn.decodeJid(jid);
            let name = conn.getName(jid);
            const phoneNumber = PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
            return name ? chalk.cyan('   👤 ') + chalk.white(`${phoneNumber}`) + chalk.gray(` (${name})`) : '';
        }).filter(Boolean);
        
        params.forEach(param => {
            console.log(
                chalk.cyan('║ ') + 
                param + 
                ' '.repeat(58 - param.replace(/\x1b\[[0-9;]*m/g, '').length) + 
                chalk.cyan('║')
            );
        });
    }

    // Información adicional basada en el tipo
    if (/document/i.test(m.mtype)) {
        console.log(
            chalk.cyan('║ ') + 
            chalk.yellow.bold('📄 DOCUMENT: ') + 
            chalk.white(m.msg.fileName || m.msg.displayName || 'Documento sin nombre') + 
            ' '.repeat(38 - (m.msg.fileName || m.msg.displayName || 'Documento sin nombre').length) + 
            chalk.cyan('║')
        );
    } else if (/contact/i.test(m.mtype)) {
        console.log(
            chalk.cyan('║ ') + 
            chalk.green.bold('👤 CONTACT: ') + 
            chalk.white(m.msg.displayName || 'Contacto') + 
            ' '.repeat(46 - (m.msg.displayName || 'Contacto').length) + 
            chalk.cyan('║')
        );
    } else if (/audio/i.test(m.mtype)) {
        const duration = m.msg.seconds || 0;
        const durationStr = `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`;
        const audioType = m.msg.ptt ? 'PTT' : 'Audio';
        
        console.log(
            chalk.cyan('║ ') + 
            chalk.blue.bold('🎵 ' + audioType + ': ') + 
            chalk.white(`Duración: ${durationStr}`) + 
            ' '.repeat(45 - `Duración: ${durationStr}`.length) + 
            chalk.cyan('║')
        );
    }

    // Pie del recuadro
    console.log(
        chalk.cyan('╚' + '═'.repeat(60) + '╝\n')
    );
}

let file = global.__filename(import.meta.url);
watchFile(file, () => {
    console.log(chalk.bold.magenta('🔄 ') + chalk.yellow('Actualizando ') + chalk.cyan('lib/print.js'));
});