import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]

    if (chat.welcome === undefined) chat.welcome = true
    if (chat.welcome === false && chat.welcome !== true) chat.welcome = true

    console.log(`🛡️ Estado defensa para ${m.chat}:`, chat.welcome)

    if (!chat.welcome) {
      console.log('🛡️ Defensas desactivadas, ignorando...')
      return true
    }

    const groupSize = (participants || []).length

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        let ppUrl = null
        try {
          ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => null)
        } catch (e) {
          console.log('Error obteniendo insignia del guerrero:', e)
        }

        if (!ppUrl) {
          ppUrl = 'https://cdn.hostrta.win/fl/g3x7.jpg'
        }

        console.log('⚔️ Desplegando protocolo de bienvenida...')

        await conn.sendMessage(jid, {
          text: text,
          contextInfo: {
            mentionedJid: [user],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.ch.ch1,
              newsletterName: '🛡️ FORTALEZA DEL ESCUDO',
              serverMessageId: -1
            },
            externalAdReply: {
              title: `🛡️ ${botname} ☆`,
              body: `⚔️ ${groupSize} guerreros activos`,
              thumbnailUrl: ppUrl,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted })

      } catch (err) {
        console.log('Error en protocolo de bienvenida:', err)
        return await conn.reply(jid, text, quoted, { mentions: [user] })
      }
    }

    if (m.messageStubType === 27) {
      console.log('🛡️ Nuevo aliado detectado en la fortaleza')

      const users = m.messageStubParameters || []
      if (users.length === 0) {
        console.log('⚠️ No se detectaron guerreros en los parámetros')
        return true
      }

      for (const user of users) {
        if (!user) continue

        const mentionTag = '@' + user.replace(/@.+/, '')

        const welcomeText = `⚔️☆✧🛡️✦♡❃۞➳↷✦

🛡️ ━━━━━━━━━━━━━━━━ 🛡️
       ✧ 𝐍𝐔𝐄𝐕𝐎 𝐆𝐔𝐄𝐑𝐑𝐄𝐑𝐎 ✧
🛡️ ━━━━━━━━━━━━━━━━ 🛡️

☆ Guerrero: ${mentionTag}
✧ Fortaleza: ${groupMetadata?.subject || 'Sin nombre'}
✦ Aliados: ${groupSize}
♡ ${global.welcom1 || 'Tu escudo nos protege'}

🛡️ Código de honor:
❀ Defiende a tus compañeros
❀ No traiciones la confianza
❀ Sigue las leyes de la fortaleza
❀ Lucha con honor

✧━━━━━━━━━━━━━━━━✧
   🛡️ 𝐄𝐒𝐂𝐔𝐃𝐎 𝐃𝐄 𝐋𝐀 𝐈𝐑𝐀
✧━━━━━━━━━━━━━━━━✧`

        await sendSingleWelcome(m.chat, welcomeText, user, m)
        console.log(`✅ Protocolo activado para ${mentionTag}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return true
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      console.log(`🛡️ Guerrero abandona la fortaleza (tipo ${m.messageStubType})`)

      const users = m.messageStubParameters || []
      if (users.length === 0) return true

      for (const user of users) {
        if (!user) continue

        const mentionTag = '@' + user.replace(/@.+/, '')

        const byeText = `⚔️☆✧🛡️✦♡❃۞➳↷✦

🛡️ ━━━━━━━━━━━━━━━━ 🛡️
       ✧ 𝐇𝐀𝐒𝐓𝐀 𝐋𝐔𝐄𝐆𝐎 ✧
🛡️ ━━━━━━━━━━━━━━━━ 🛡️

☆ Guerrero: ${mentionTag}
✧ Fortaleza: ${groupMetadata?.subject || 'Sin nombre'}
❃ ${global.welcom2 || 'Tu escudo siempre será recordado'}

🛡️ Palabras de despedida:
❀ Que tu camino esté protegido
❀ Las puertas siempre estarán abiertas
❀ Lucha con honor en tu próximo destino
❀ Que el escudo te guíe

✧━━━━━━━━━━━━━━━━✧
   🛡️ 𝐄𝐒𝐂𝐔𝐃𝐎 𝐃𝐄 𝐋𝐀 𝐈𝐑𝐀
✧━━━━━━━━━━━━━━━━✧`

        await sendSingleWelcome(m.chat, byeText, user, m)
        console.log(`✅ Despedida honrosa para ${mentionTag}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return true
    }

    return true

  } catch (e) {
    console.error('🛡️ Error en protocolos de la fortaleza', e)
    return true
  }
}