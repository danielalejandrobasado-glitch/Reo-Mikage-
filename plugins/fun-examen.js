import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Clase para manejar el examen
class ExamenManager {
    constructor() {
        this.examenes = new Map();
        this.cargarExamenes();
    }

    cargarExamenes() {
        const examsPath = join(__dirname, 'examenes.json');
        if (fs.existsSync(examsPath)) {
            const data = fs.readFileSync(examsPath, 'utf-8');
            this.examenes = new Map(Object.entries(JSON.parse(data)));
        }
    }

    guardarExamenes() {
        const examsPath = join(__dirname, 'examenes.json');
        const obj = Object.fromEntries(this.examenes);
        fs.writeFileSync(examsPath, JSON.stringify(obj, null, 2));
    }

    crearExamen(usuario, preguntas) {
        const examen = {
            usuario,
            preguntas,
            respuestas: [],
            puntaje: 0,
            estado: 'activo',
            fechaInicio: new Date().toISOString(),
            tiempoLimite: 600 // 10 minutos en segundos
        };
        this.examenes.set(usuario, examen);
        this.guardarExamenes();
        return examen;
    }

    responderPregunta(usuario, preguntaIndex, respuesta) {
        const examen = this.examenes.get(usuario);
        if (!examen || examen.estado !== 'activo') return null;

        examen.respuestas[preguntaIndex] = respuesta;
        
        // Verificar si es la respuesta correcta
        const pregunta = examen.preguntas[preguntaIndex];
        if (pregunta.respuestaCorrecta === respuesta) {
            examen.puntaje += pregunta.puntos || 1;
        }

        this.guardarExamenes();
        return examen;
    }

    finalizarExamen(usuario) {
        const examen = this.examenes.get(usuario);
        if (!examen) return null;

        examen.estado = 'finalizado';
        examen.fechaFin = new Date().toISOString();
        examen.tiempoUsado = Math.floor((new Date(examen.fechaFin) - new Date(examen.fechaInicio)) / 1000);

        this.guardarExamenes();
        return examen;
    }

    obtenerResultado(usuario) {
        const examen = this.examenes.get(usuario);
        if (!examen) return null;

        let resultado = `📝 *RESULTADO DEL EXAMEN*\n\n`;
        resultado += `👤 Usuario: ${examen.usuario}\n`;
        resultado += `📊 Puntaje: ${examen.puntaje}/${examen.preguntas.reduce((acc, p) => acc + (p.puntos || 1), 0)}\n`;
        resultado += `⏱️ Tiempo: ${examen.tiempoUsado}s\n\n`;

        examen.preguntas.forEach((pregunta, index) => {
            resultado += `Pregunta ${index + 1}: ${pregunta.texto}\n`;
            resultado += `Tu respuesta: ${examen.respuestas[index] || 'No respondida'}\n`;
            resultado += `Respuesta correcta: ${pregunta.respuestaCorrecta}\n`;
            resultado += `Puntos: ${pregunta.puntos || 1}\n\n`;
        });

        return resultado;
    }
}

const examenManager = new ExamenManager();

// Banco de preguntas predefinidas
const bancoPreguntas = {
    matematica: [
        {
            texto: "¿Cuánto es 5 + 7?",
            opciones: ["10", "11", "12", "13"],
            respuestaCorrecta: "12",
            puntos: 2
        },
        {
            texto: "¿Cuál es la raíz cuadrada de 64?",
            opciones: ["6", "7", "8", "9"],
            respuestaCorrecta: "8",
            puntos: 2
        },
        {
            texto: "Resuelve: 2x + 5 = 15",
            opciones: ["x = 5", "x = 6", "x = 7", "x = 8"],
            respuestaCorrecta: "x = 5",
            puntos: 3
        }
    ],
    programacion: [
        {
            texto: "¿Qué significa HTML?",
            opciones: [
                "Hyper Text Markup Language",
                "High Tech Modern Language",
                "Hyper Transfer Markup Language",
                "Home Tool Markup Language"
            ],
            respuestaCorrecta: "Hyper Text Markup Language",
            puntos: 2
        },
        {
            texto: "¿Cuál es el resultado de console.log(typeof [])?",
            opciones: ["array", "object", "undefined", "null"],
            respuestaCorrecta: "object",
            puntos: 3
        },
        {
            texto: "En JavaScript, ¿qué es 'NaN'?",
            opciones: [
                "Not a Number",
                "Null and None",
                "New Array Notation",
                "Number and Numeric"
            ],
            respuestaCorrecta: "Not a Number",
            puntos: 2
        }
    ],
    cultura: [
        {
            texto: "¿Cuál es la capital de Francia?",
            opciones: ["Londres", "Berlín", "París", "Madrid"],
            respuestaCorrecta: "París",
            puntos: 1
        },
        {
            texto: "¿Quién pintó la Mona Lisa?",
            opciones: [
                "Vincent van Gogh",
                "Pablo Picasso",
                "Leonardo da Vinci",
                "Michelangelo"
            ],
            respuestaCorrecta: "Leonardo da Vinci",
            puntos: 2
        }
    ]
};

// Función para mostrar preguntas
function mostrarExamen(preguntas) {
    let mensaje = "📝 *EXAMEN INICIADO*\n\n";
    mensaje += "Responde con el número de la opción (ej: 1, 2, 3, 4)\n\n";

    preguntas.forEach((pregunta, index) => {
        mensaje += `*Pregunta ${index + 1}:* ${pregunta.texto}\n`;
        pregunta.opciones.forEach((opcion, opcIndex) => {
            mensaje += `${opcIndex + 1}. ${opcion}\n`;
        });
        mensaje += "\n";
    });

    mensaje += "⚠️ Tienes 10 minutos para completar el examen.";
    return mensaje;
}

// Handler principal
const handler = async (m, { conn, args, usedPrefix, command }) => {
    const sender = m.sender;
    const comando = args[0]?.toLowerCase();

    try {
        // Comando: Iniciar examen
        if (comando === 'iniciar') {
            const materia = args[1]?.toLowerCase() || 'matematica';
            
            if (!bancoPreguntas[materia]) {
                return m.reply(`❌ Materia no disponible. Materias: ${Object.keys(bancoPreguntas).join(', ')}`);
            }

            const preguntas = bancoPreguntas[materia];
            const examen = examenManager.crearExamen(sender, preguntas);

            const mensajeExamen = mostrarExamen(preguntas);
            await conn.sendMessage(m.chat, {
                text: mensajeExamen
            }, { quoted: m });

            // Enviar instrucciones separadas
            await conn.sendMessage(m.chat, {
                text: `📋 *INSTRUCCIONES*\n\n` +
                      `Usa: *${usedPrefix}examen responder <número_pregunta> <opción>*\n` +
                      `Ejemplo: *${usedPrefix}examen responder 1 3*\n\n` +
                      `Para finalizar: *${usedPrefix}examen finalizar*`
            }, { quoted: m });
        }

        // Comando: Responder pregunta
        else if (comando === 'responder') {
            const preguntaIndex = parseInt(args[1]) - 1;
            const respuesta = parseInt(args[2]) - 1;

            if (isNaN(preguntaIndex) || isNaN(respuesta)) {
                return m.reply(`❌ Formato incorrecto. Usa: ${usedPrefix}examen responder <pregunta> <opcion>`);
            }

            const examen = examenManager.examenes.get(sender);
            if (!examen || examen.estado !== 'activo') {
                return m.reply('❌ No tienes un examen activo.');
            }

            if (preguntaIndex < 0 || preguntaIndex >= examen.preguntas.length) {
                return m.reply(`❌ Número de pregunta inválido. Tienes ${examen.preguntas.length} preguntas.`);
            }

            if (respuesta < 0 || respuesta >= examen.preguntas[preguntaIndex].opciones.length) {
                return m.reply(`❌ Opción inválida. Las opciones van del 1 al ${examen.preguntas[preguntaIndex].opciones.length}.`);
            }

            const opcionSeleccionada = examen.preguntas[preguntaIndex].opciones[respuesta];
            examenManager.responderPregunta(sender, preguntaIndex, opcionSeleccionada);

            await m.reply(`✅ Pregunta ${preguntaIndex + 1} respondida: "${opcionSeleccionada}"`);
        }

        // Comando: Finalizar examen
        else if (comando === 'finalizar') {
            const examen = examenManager.finalizarExamen(sender);
            if (!examen) {
                return m.reply('❌ No tienes un examen activo.');
            }

            const resultado = examenManager.obtenerResultado(sender);
            await conn.sendMessage(m.chat, {
                text: resultado
            }, { quoted: m });

            examenManager.examenes.delete(sender);
        }

        // Comando: Ver progreso
        else if (comando === 'progreso') {
            const examen = examenManager.examenes.get(sender);
            if (!examen) {
                return m.reply('❌ No tienes un examen activo.');
            }

            let progreso = `📊 *PROGRESO DEL EXAMEN*\n\n`;
            progreso += `Preguntas totales: ${examen.preguntas.length}\n`;
            progreso += `Respondidas: ${examen.respuestas.filter(r => r).length}\n`;
            progreso += `Puntaje actual: ${examen.puntaje}\n`;
            progreso += `Tiempo transcurrido: ${Math.floor((new Date() - new Date(examen.fechaInicio)) / 1000)}s\n`;
            
            await m.reply(progreso);
        }

        // Comando: Ver materias disponibles
        else if (comando === 'materias') {
            let listaMaterias = "📚 *MATERIAS DISPONIBLES*\n\n";
            Object.keys(bancoPreguntas).forEach(materia => {
                listaMaterias += `• ${materia.charAt(0).toUpperCase() + materia.slice(1)}: ${bancoPreguntas[materia].length} preguntas\n`;
            });

            listaMaterias += `\nUsa: ${usedPrefix}examen iniciar <materia>`;
            await m.reply(listaMaterias);
        }

        // Comando: Ayuda
        else {
            await conn.sendMessage(m.chat, {
                text: `📚 *SISTEMA DE EXAMENES*\n\n` +
                      `*Comandos disponibles:*\n\n` +
                      `• ${usedPrefix}examen iniciar <materia> - Iniciar examen\n` +
                      `• ${usedPrefix}examen responder <pregunta> <opcion> - Responder pregunta\n` +
                      `• ${usedPrefix}examen finalizar - Finalizar examen\n` +
                      `• ${usedPrefix}examen progreso - Ver progreso\n` +
                      `• ${usedPrefix}examen materias - Ver materias disponibles\n\n` +
                      `*Ejemplos:*\n` +
                      `${usedPrefix}examen iniciar programacion\n` +
                      `${usedPrefix}examen responder 1 3\n` +
                      `${usedPrefix}examen finalizar\n\n` +
                      `*Materias disponibles:* ${Object.keys(bancoPreguntas).join(', ')}`
            }, { quoted: m });
        }

    } catch (error) {
        console.error(error);
        await m.reply('❌ Ocurrió un error en el sistema de exámenes.');
    }
};

handler.help = ['examen'];
handler.tags = ['educacion', 'juegos'];
handler.command = ['examen', 'exam', 'test'];
export default handler;