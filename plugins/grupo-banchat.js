let handler = async (m, { conn, isAdmin, isROwner }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    const chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat]
    chat.isBanned = true
    await conn.reply(m.chat, `💙 Chat Baneado con exito.`, m, global.rcanal)
    await m.react('✅')
}
handler.help = ['banearbot']
handler.tags = ['group']
handler.command = ['banearbot', 'banchat']
handler.group = true 
handler.register = true;
export default handler

