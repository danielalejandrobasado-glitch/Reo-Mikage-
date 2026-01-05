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

    console.log(`🔍 Estado welcome para ${m.chat}:`, chat.welcome)

    if (!chat.welcome) {
      console.log('❌ Welcome desactivado, saltando...')
      return true
    }

    const groupSize = (participants || []).length

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        let ppUrl = null
        try {
          ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => null)
        } catch (e) {
          console.log('Error obteniendo foto de perfil:', e)
        }

        if (!ppUrl) {
          ppUrl = 'https://cdn.hostrta.win/fl/zcc7.jpeg'
        }

        console.log('📤 Enviando welcome con diseño...')

        await conn.sendMessage(jid, {
          text: text,
          contextInfo: {
            mentionedJid: [user],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.ch.ch1,
              newsletterName: '💎 𝐑𝐄𝐎 𝐌𝐈𝐊𝐀𝐆𝐄',
              serverMessageId: -1
            },
            externalAdReply: {
              title: `❀ ${botname} ☆`,
              body: `✧ ${groupSize} miembros activos`,
              thumbnailUrl: ppUrl,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted })

      } catch (err) {
        console.log('sendSingleWelcome error:', err)
        return await conn.reply(jid, text, quoted, { mentions: [user] })
      }
    }

    if (m.messageStubType === 27) {
      console.log('🎉 Nuevo usuario detectado (tipo 27)')

      const users = m.messageStubParameters || []
      if (users.length === 0) {
        console.log('⚠️ No hay usuarios en messageStubParameters')
        return true
      }

      for (const user of users) {
        if (!user) continue

        const mentionTag = '@' + user.replace(/@.+/, '')

        const welcomeText = `❀☆✯♡۞❃✦✧➳↷✦

❃ ━━━━━━━━━━━━━━━━ ❃
       ✧ 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 ✧
❃ ━━━━━━━━━━━━━━━━ ❃

☆ Usuario: ${mentionTag}
✯ Grupo: ${groupMetadata?.subject || 'Sin nombre'}
✦ Miembros: ${groupSize}
♡ ${global.welcom1 || 'Bienvenido a la comunidad'}

۞ Recomendaciones:
❀ Respeta a los demás
❀ No envíes spam
❀ Lee las reglas
❀ Disfruta tu estadía

✧━━━━━━━━━━━━━━━━✧
   💎 𝐑𝐄𝐎 𝐌𝐈𝐊𝐀𝐆𝐄
✧━━━━━━━━━━━━━━━━✧`

        await sendSingleWelcome(m.chat, welcomeText, user, m)
        console.log(`✅ Welcome enviado a ${mentionTag}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return true
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      console.log(`👋 Usuario salió (tipo ${m.messageStubType})`)

      const users = m.messageStubParameters || []
      if (users.length === 0) return true

      for (const user of users) {
        if (!user) continue

        const mentionTag = '@' + user.replace(/@.+/, '')

        const byeText = `❀☆✯♡۞❃✦✧➳↷✦

✦ ━━━━━━━━━━━━━━━━ ✦
       ♡ 𝐀𝐃𝐈𝐎𝐒 ♡
✦ ━━━━━━━━━━━━━━━━ ✦

☆ Usuario: ${mentionTag}
✯ Grupo: ${groupMetadata?.subject || 'Sin nombre'}
❃ ${global.welcom2 || 'Gracias por tu tiempo'}

۞ Nota:
❀ Esperamos verte pronto
❀ Siempre serás bienvenido
❀ Que tengas buen día

✧━━━━━━━━━━━━━━━━✧
   💎 𝐑𝐄𝐎 𝐌𝐈𝐊𝐀𝐆𝐄
✧━━━━━━━━━━━━━━━━✧`

        await sendSingleWelcome(m.chat, byeText, user, m)
        console.log(`✅ Goodbye enviado a ${mentionTag}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return true
    }

    return true

  } catch (e) {
    console.error('plugins/_welcome error', e)
    return true
  }
}