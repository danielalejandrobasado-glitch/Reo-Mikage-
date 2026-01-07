const ApiKey = 'Duarte-zz12'

let handler = async (m, { conn, usedPrefix }) => {
    let type = m.text.slice(usedPrefix.length).trim().split(/\s+/)[0]

    let url = `https://rest.alyabotpe.xyz/nsfw/interaction?type=${type}&key=${ApiKey}`

    try {
        let res = await fetch(url)
        let json = await res.json()

        if (!json.status) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return conn.reply(m.chat, json.message, m)
        }

        await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })

        if (json.result?.url) {
            await conn.sendMessage(
                m.chat,
                { video: { url: json.result.url }, gifPlayback: true },
                { quoted: m }
            )
        }
    } catch {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
        conn.reply(m.chat, 'Error al conectar con la API', m)
    }
}

handler.help = [
    'blowjob',
    'yuri',
    'boobjob',
    'cum',
    'fap',
    'anal',
    'grabboobs',
    'footjob',
    'grope',
    'undress',
    'sixnine',
    'lickpussy',
    'spank',
    'fuck',
    'suckboobs'
]

handler.tags = ['nsfw']

handler.command = handler.help

handler.group = true
handler.register = true

export default handler