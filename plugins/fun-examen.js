// examen-bot.js - TODO EN UN SOLO ARCHIVO
import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';

// ========== BASE DE DATOS DE EXÁMENES ==========
const examenesDB = {
  categorias: [
    "Matemáticas", "Ciencias Naturales", "Historia", "Geografía", "Lenguaje",
    "Inglés", "Física", "Química", "Biología", "Educación Física",
    "Arte", "Música", "Filosofía", "Tecnología", "Economía",
    "Cívica", "Psicología"
  ],

  examenes: [
    {
      id: 1,
      categoria: "Matemáticas",
      preguntas: [
        { texto: "¿Cuánto es 2 + 2?", opciones: ["3", "4", "5", "6"], respuesta: 1, dificultad: "fácil" },
        { texto: "Resuelve: 3x + 5 = 20", opciones: ["x = 3", "x = 5", "x = 7", "x = 10"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Cuál es el área de un círculo con radio 4? (π ≈ 3.14)", opciones: ["25.12", "50.24", "12.56", "16"], respuesta: 1, dificultad: "media" },
        { texto: "Deriva: f(x) = 3x² + 2x - 5", opciones: ["6x + 2", "3x + 2", "6x² + 2", "3x + 5"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es un número primo?", opciones: ["Número divisible entre 2", "Número con más de dos divisores", "Número divisible solo por 1 y sí mismo", "Número decimal"], respuesta: 2, dificultad: "fácil" },
        { texto: "Calcula la integral ∫(2x)dx", opciones: ["x²", "x² + C", "2x²", "2x² + C"], respuesta: 1, dificultad: "difícil" },
        { texto: "¿Cuántos grados tiene un triángulo?", opciones: ["90°", "180°", "270°", "360°"], respuesta: 1, dificultad: "fácil" },
        { texto: "Resuelve: log₁₀100", opciones: ["1", "2", "10", "100"], respuesta: 1, dificultad: "media" },
        { texto: "¿Cuál es el MCD de 12 y 18?", opciones: ["2", "3", "6", "9"], respuesta: 2, dificultad: "media" },
        { texto: "¿Qué es la hipotenusa?", opciones: ["Lado más corto de un triángulo", "Lado opuesto al ángulo recto", "Ángulo de 90 grados", "Perímetro del triángulo"], respuesta: 1, dificultad: "fácil" }
      ]
    },
    {
      id: 2,
      categoria: "Ciencias Naturales",
      preguntas: [
        { texto: "¿Qué planeta es conocido como el planeta rojo?", opciones: ["Venus", "Marte", "Júpiter", "Saturno"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Cuál es el proceso de las plantas para producir alimento?", opciones: ["Respiración", "Fotosíntesis", "Digestión", "Evaporación"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Qué es la mitosis?", opciones: ["División celular para reproducción sexual", "División celular para crecimiento", "Proceso de fotosíntesis", "Tipo de respiración"], respuesta: 1, dificultad: "media" },
        { texto: "Explica la teoría de la relatividad de Einstein", opciones: ["Teoría sobre gravedad y tiempo-espacio", "Teoría de evolución", "Teoría cuántica", "Teoría atómica"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué gas necesitan las plantas para la fotosíntesis?", opciones: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué es un ecosistema?", opciones: ["Solo animales en un lugar", "Interacción entre seres vivos y ambiente", "Grupo de plantas", "Tipo de clima"], respuesta: 1, dificultad: "media" },
        { texto: "¿Cuál es el elemento más abundante en el universo?", opciones: ["Oxígeno", "Carbono", "Hierro", "Hidrógeno"], respuesta: 3, dificultad: "difícil" },
        { texto: "¿Qué mide un termómetro?", opciones: ["Presión", "Temperatura", "Humedad", "Volumen"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Qué son los fósiles?", opciones: ["Rocas volcánicas", "Restos de seres vivos antiguos", "Minerales preciosos", "Tipos de suelo"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué planeta tiene anillos visibles?", opciones: ["Marte", "Venus", "Saturno", "Mercurio"], respuesta: 2, dificultad: "fácil" }
      ]
    },
    {
      id: 3,
      categoria: "Historia",
      preguntas: [
        { texto: "¿En qué año Colón llegó a América?", opciones: ["1492", "1500", "1520", "1488"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué civilización construyó las pirámides de Egipto?", opciones: ["Romanos", "Griegos", "Egipcios", "Mayas"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Cuándo comenzó la Primera Guerra Mundial?", opciones: ["1914", "1918", "1939", "1945"], respuesta: 0, dificultad: "media" },
        { texto: "Explica las causas de la Revolución Francesa", opciones: ["Crisis económica y desigualdad social", "Invasión extranjera", "Cambio climático", "Avances tecnológicos"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Quién pintó la Mona Lisa?", opciones: ["Van Gogh", "Picasso", "Da Vinci", "Miguel Ángel"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué fue el Imperio Romano?", opciones: ["Civilización asiática", "Imperio europeo antiguo", "Reino africano", "Civilización precolombina"], respuesta: 1, dificultad: "media" },
        { texto: "¿Quién fue Simón Bolívar?", opciones: ["Explorador español", "Libertador de América", "Rey de España", "Científico"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué fue la Guerra Fría?", opciones: ["Conflicto directo EEUU-URSS", "Tensión política sin combate directo", "Guerra en Asia", "Conflicto medieval"], respuesta: 1, dificultad: "difícil" },
        { texto: "¿Dónde surgió la civilización griega?", opciones: ["Asia", "Europa", "América", "África"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Qué inventó Gutenberg?", opciones: ["Teléfono", "Imprenta", "Electricidad", "Motor"], respuesta: 1, dificultad: "media" }
      ]
    },
    {
      id: 4,
      categoria: "Geografía",
      preguntas: [
        { texto: "¿Cuál es el río más largo del mundo?", opciones: ["Amazonas", "Nilo", "Misisipi", "Yangtsé"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la latitud?", opciones: ["Distancia este-oeste", "Distancia norte-sur", "Altura sobre el mar", "Profundidad oceánica"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Dónde está el desierto del Sahara?", opciones: ["Asia", "América", "África", "Australia"], respuesta: 2, dificultad: "media" },
        { texto: "Explica el efecto invernadero", opciones: ["Calentamiento global por gases", "Fenómeno meteorológico local", "Estación del año", "Tipo de clima polar"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Cuál es la capital de Francia?", opciones: ["Londres", "Berlín", "París", "Roma"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué es un tsunami?", opciones: ["Ola gigante por terremoto", "Viento fuerte", "Lluvia intensa", "Nieve abundante"], respuesta: 0, dificultad: "media" },
        { texto: "¿Cuál es el país más grande del mundo?", opciones: ["China", "Estados Unidos", "Rusia", "Canadá"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué es la tectónica de placas?", opciones: ["Movimiento de continentes", "Tipo de roca", "Fenómeno atmosférico", "Corriente oceánica"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Dónde están los Andes?", opciones: ["América del Sur", "Asia", "Europa", "África"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el ecuador?", opciones: ["Línea imaginaria norte-sur", "Línea imaginaria este-oeste", "Polo norte", "Polo sur"], respuesta: 1, dificultad: "fácil" }
      ]
    },
    {
      id: 5,
      categoria: "Lenguaje",
      preguntas: [
        { texto: "¿Qué es un sustantivo?", opciones: ["Palabra que indica acción", "Palabra que nombra cosas", "Palabra que describe", "Palabra que enlaza"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Cuál es la diferencia entre 'hay', 'ahí' y 'ay'?", opciones: ["Son iguales", "Difieren en significado", "Solo una es correcta", "Son sinónimos"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué es una metáfora?", opciones: ["Comparación con 'como'", "Atribución humana a cosas", "Identificación directa entre cosas", "Exageración"], respuesta: 2, dificultad: "difícil" },
        { texto: "¿Quién escribió 'Cien años de soledad'?", opciones: ["Pablo Neruda", "Gabriel García Márquez", "Mario Vargas Llosa", "Julio Cortázar"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué es un verbo?", opciones: ["Palabra que nombra", "Palabra que describe", "Palabra que indica acción", "Palabra que enlaza"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué es un sinónimo?", opciones: ["Palabra opuesta", "Palabra similar", "Palabra inventada", "Palabra extranjera"], respuesta: 1, dificultad: "fácil" },
        { texto: "Analiza la estructura de un soneto", opciones: ["14 versos endecasílabos", "Versos libres", "8 versos alejandrinos", "Sin estructura fija"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es la tilde diacrítica?", opciones: ["Acento en todas las palabras", "Acento que distingue significado", "Sin acento", "Acento opcional"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué tipo de palabra es 'rápidamente'?", opciones: ["Sustantivo", "Verbo", "Adjetivo", "Adverbio"], respuesta: 3, dificultad: "fácil" },
        { texto: "¿Qué es una rima asonante?", opciones: ["Rima en vocales y consonantes", "Rima solo en vocales", "Sin rima", "Rima irregular"], respuesta: 1, dificultad: "media" }
      ]
    },
    {
      id: 6,
      categoria: "Inglés",
      preguntas: [
        { texto: "What is the past tense of 'go'?", opciones: ["goed", "went", "gone", "goes"], respuesta: 1, dificultad: "fácil" },
        { texto: "Translate: 'House'", opciones: ["Casa", "Perro", "Libro", "Escuela"], respuesta: 0, dificultad: "fácil" },
        { texto: "What is the plural of 'child'?", opciones: ["childs", "children", "childes", "childen"], respuesta: 1, dificultad: "media" },
        { texto: "Which is correct: 'If I were you' or 'If I was you'?", opciones: ["If I were you", "If I was you", "Both", "Neither"], respuesta: 0, dificultad: "difícil" },
        { texto: "What does 'hello' mean?", opciones: ["Adiós", "Hola", "Gracias", "Por favor"], respuesta: 1, dificultad: "fácil" },
        { texto: "Choose the correct: 'She ____ to school every day.'", opciones: ["go", "goes", "going", "went"], respuesta: 1, dificultad: "media" },
        { texto: "What is a 'phrasal verb'?", opciones: ["Verb + preposition/adverb", "Regular verb", "Past tense", "Plural verb"], respuesta: 0, dificultad: "difícil" },
        { texto: "What is the opposite of 'big'?", opciones: ["large", "small", "tall", "wide"], respuesta: 1, dificultad: "fácil" },
        { texto: "How do you say 'gracias' in English?", opciones: ["Please", "Thank you", "Sorry", "Hello"], respuesta: 1, dificultad: "fácil" },
        { texto: "What is the present continuous of 'run'?", opciones: ["running", "ran", "runs", "runned"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 7,
      categoria: "Física",
      preguntas: [
        { texto: "¿Qué mide la velocidad?", opciones: ["Distancia", "Tiempo", "Distancia/tiempo", "Masa"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué es la gravedad?", opciones: ["Fuerza de atracción entre masas", "Tipo de energía", "Medida de temperatura", "Velocidad de la luz"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Cuál es la fórmula de la fuerza?", opciones: ["F = m/v", "F = m × a", "F = v/t", "F = d × t"], respuesta: 1, dificultad: "media" },
        { texto: "Explica la teoría de la relatividad general", opciones: ["Gravedad como curvatura del espacio-tiempo", "Teoría atómica", "Movimiento de partículas", "Energía nuclear"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es la energía cinética?", opciones: ["Energía por posición", "Energía por movimiento", "Energía térmica", "Energía eléctrica"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué es la luz?", opciones: ["Onda electromagnética", "Partícula sólida", "Tipo de sonido", "Forma de materia"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es un Newton?", opciones: ["Unidad de fuerza", "Unidad de masa", "Unidad de tiempo", "Unidad de energía"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué dice la primera ley de Newton?", opciones: ["Ley de gravitación", "Ley de inercia", "Acción y reacción", "Fuerza y aceleración"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué es la electricidad?", opciones: ["Flujo de electrones", "Tipo de calor", "Fuerza magnética", "Energía nuclear"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un imán?", opciones: ["Objeto con campo magnético", "Tipo de metal", "Conductor eléctrico", "Aislante térmico"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 8,
      categoria: "Química",
      preguntas: [
        { texto: "¿Qué es un átomo?", opciones: ["Partícula más pequeña de un elemento", "Combinación de moléculas", "Tipo de enlace", "Estado de la materia"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es H₂O?", opciones: ["Agua", "Oxígeno", "Hidrógeno", "Sal"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la tabla periódica?", opciones: ["Organización de elementos", "Tabla de multiplicar", "Lista de compuestos", "Tabla de medidas"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la diferencia entre enlace iónico y covalente", opciones: ["Iónico: transferencia; Covalente: compartición", "Ambos iguales", "Iónico más fuerte", "Covalente solo en gases"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es una reacción química?", opciones: ["Cambio físico", "Transformación de sustancias", "Mezcla simple", "Cambio de estado"], respuesta: 1, dificultad: "media" },
        { texto: "¿Qué es el pH?", opciones: ["Medida de acidez", "Tipo de elemento", "Unidad de masa", "Medida de temperatura"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es el oxígeno?", opciones: ["Gas vital", "Metal", "Líquido", "Sólido"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la combustión?", opciones: ["Reacción con oxígeno y calor", "Tipo de disolución", "Cambio de estado", "Enfriamiento"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un elemento químico?", opciones: ["Sustancia pura", "Mezcla", "Compuesto", "Disolución"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la molécula?", opciones: ["Grupo de átomos", "Partícula subatómica", "Tipo de ion", "Estado de la materia"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 9,
      categoria: "Biología",
      preguntas: [
        { texto: "¿Qué es la célula?", opciones: ["Unidad básica de la vida", "Tipo de tejido", "Órgano pequeño", "Sistema biológico"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el ADN?", opciones: ["Material genético", "Tipo de proteína", "Hormona", "Enzima"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la evolución?", opciones: ["Cambio en especies", "Crecimiento individual", "Reproducción", "Metabolismo"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la teoría de la selección natural", opciones: ["Supervivencia del más apto", "Herencia de caracteres", "Mutación aleatoria", "Adaptación inmediata"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué son los mamíferos?", opciones: ["Animales con pelo y glándulas mamarias", "Animales con escamas", "Animales con plumas", "Animales acuáticos"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el sistema circulatorio?", opciones: ["Transporte de sangre", "Digestión de alimentos", "Respiración", "Eliminación de desechos"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué son las bacterias?", opciones: ["Microorganismos unicelulares", "Virus", "Hongos", "Plantas pequeñas"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la fotosíntesis?", opciones: ["Proceso de las plantas para hacer alimento", "Respiración celular", "Digestión animal", "Circulación sanguínea"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué son los órganos?", opciones: ["Estructuras con funciones específicas", "Tipos de células", "Sistemas completos", "Tejidos básicos"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un ecosistema?", opciones: ["Comunidad de seres vivos y su ambiente", "Solo animales", "Solo plantas", "Solo microorganismos"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 10,
      categoria: "Educación Física",
      preguntas: [
        { texto: "¿Qué es el calentamiento?", opciones: ["Preparación antes del ejercicio", "Enfriamiento después", "Parte principal", "Descanso"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Cuánto tiempo de ejercicio se recomienda diariamente?", opciones: ["30 minutos", "2 horas", "5 minutos", "10 horas"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué son los ejercicios aeróbicos?", opciones: ["De baja intensidad y larga duración", "De alta intensidad y corta duración", "Sin movimiento", "Solo flexibilidad"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la importancia de la hidratación en el deporte", opciones: ["Regula temperatura y previene calambres", "Solo para sed", "Para peso", "Para sueño"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué mide la frecuencia cardíaca?", opciones: ["Latidos por minuto", "Presión", "Temperatura", "Oxígeno"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la flexibilidad?", opciones: ["Rango de movimiento articular", "Fuerza muscular", "Resistencia", "Velocidad"], respuesta: 0, dificultad: "media" },
        { texto: "¿Cuál es un deporte de equipo?", opciones: ["Fútbol", "Atletismo", "Natación", "Ciclismo"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el fair play?", opciones: ["Juego limpio", "Ganar a toda costa", "Hacer trampa", "No seguir reglas"], respuesta: 0, dificultad: "media" },
        { texto: "¿Para qué sirven los estiramientos?", opciones: ["Prevenir lesiones", "Aumentar fuerza", "Aumentar velocidad", "Perder peso"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una dieta balanceada?", opciones: ["Variedad de nutrientes", "Solo proteínas", "Solo carbohidratos", "Mucha grasa"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 11,
      categoria: "Arte",
      preguntas: [
        { texto: "¿Qué son los colores primarios?", opciones: ["Rojo, azul, amarillo", "Verde, naranja, violeta", "Blanco, negro, gris", "Todos los colores"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un lienzo?", opciones: ["Superficie para pintar", "Tipo de pincel", "Color", "Estilo"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la perspectiva en arte?", opciones: ["Sensación de profundidad", "Tipo de color", "Material", "Estilo histórico"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la diferencia entre arte abstracto y figurativo", opciones: ["Abstracto: no representa realidad; Figurativo: sí", "Ambos iguales", "Inverso", "Solo colores diferentes"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Quién pintó La noche estrellada?", opciones: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un boceto?", opciones: ["Dibujo preliminar", "Obra terminada", "Marco", "Firma"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la escultura?", opciones: ["Arte tridimensional", "Pintura plana", "Dibujo", "Fotografía"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el cubismo?", opciones: ["Estilo con formas geométricas", "Realismo extremo", "Arte antiguo", "Solo blanco y negro"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué son acuarelas?", opciones: ["Pintura con agua", "Óleo", "Carboncillo", "Témpera"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un museo?", opciones: ["Lugar para exhibir arte", "Taller", "Escuela", "Tienda"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 12,
      categoria: "Música",
      preguntas: [
        { texto: "¿Cuántas notas musicales hay?", opciones: ["7", "5", "12", "10"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué instrumento tiene cuerdas?", opciones: ["Guitarra", "Batería", "Trompeta", "Flauta"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el pentagrama?", opciones: ["Líneas para escribir música", "Instrumento", "Tipo de nota", "Estilo musical"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la diferencia entre compás 4/4 y 3/4", opciones: ["4/4: 4 tiempos; 3/4: 3 tiempos", "Iguales", "Al revés", "No existen"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es el rock?", opciones: ["Género musical", "Instrumento", "Nota", "Baile"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una orquesta?", opciones: ["Grupo de músicos", "Solo pianista", "Cantante solista", "Corista"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el ritmo?", opciones: ["Patrón de sonidos en el tiempo", "Melodía", "Volumen", "Instrumento"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué instrumento es de viento?", opciones: ["Saxofón", "Violín", "Piano", "Guitarra"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un coro?", opciones: ["Grupo de cantantes", "Instrumento", "Partitura", "Estudio"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el solfeo?", opciones: ["Lectura musical cantando", "Tocar piano", "Escribir letras", "Bailar"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 13,
      categoria: "Filosofía",
      preguntas: [
        { texto: "¿Qué significa filosofía?", opciones: ["Amor a la sabiduría", "Ciencia exacta", "Historia", "Arte"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Quién fue Sócrates?", opciones: ["Filósofo griego", "Rey romano", "Científico", "Artista"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la ética?", opciones: ["Estudio del bien y el mal", "Tipo de matemática", "Ciencia natural", "Lenguaje"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la alegoría de la caverna de Platón", opciones: ["Metáfora sobre conocimiento y realidad", "Historia real", "Teoría científica", "Mito religioso"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es la metafísica?", opciones: ["Estudio de la realidad fundamental", "Ciencia de números", "Arte visual", "Música"], respuesta: 0, dificultad: "media" },
        { texto: "¿Quién dijo 'Pienso, luego existo'?", opciones: ["Descartes", "Aristóteles", "Platón", "Kant"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la lógica?", opciones: ["Estudio del razonamiento válido", "Tipo de arte", "Ciencia natural", "Deporte"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un dilema moral?", opciones: ["Situación con opciones conflictivas", "Problema matemático", "Enigma histórico", "Acertijo"], respuesta: 0, dificultad: "media" },
        { texto: "¿Quién fue Aristóteles?", opciones: ["Filósofo griego discípulo de Platón", "Emperador romano", "Pintor renacentista", "Músico clásico"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el empirismo?", opciones: ["Conocimiento viene de experiencia", "Conocimiento innato", "Fe religiosa", "Imaginación"], respuesta: 0, dificultad: "difícil" }
      ]
    },
    {
      id: 14,
      categoria: "Tecnología",
      preguntas: [
        { texto: "¿Qué es una computadora?", opciones: ["Dispositivo electrónico para procesar datos", "Tipo de teléfono", "Juego", "Libro digital"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es internet?", opciones: ["Red global de computadoras", "Programa específico", "Dispositivo", "Lenguaje"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un algoritmo?", opciones: ["Serie de pasos para resolver problema", "Lenguaje de programación", "Dispositivo hardware", "Red social"], respuesta: 0, dificultad: "media" },
        { texto: "Explica diferencia entre hardware y software", opciones: ["Hardware: físico; Software: programas", "Iguales", "Al revés", "No relacionado"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es un smartphone?", opciones: ["Teléfono inteligente", "Computadora de mesa", "Tablet", "Reloj"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es programación?", opciones: ["Crear instrucciones para computadora", "Usar programas", "Navegar internet", "Escribir documentos"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un navegador web?", opciones: ["Chrome, Firefox", "Word, Excel", "Windows, macOS", "CPU, RAM"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la inteligencia artificial?", opciones: ["Máquinas que simulan inteligencia", "Programa simple", "Hardware avanzado", "Red social"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un archivo?", opciones: ["Datos almacenados", "Programa", "Dispositivo", "Red"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una red social?", opciones: ["Plataforma para conectar personas", "Programa de diseño", "Sistema operativo", "Dispositivo móvil"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 15,
      categoria: "Economía",
      preguntas: [
        { texto: "¿Qué es la oferta y demanda?", opciones: ["Ley básica de precios", "Tipo de impuesto", "Sistema bancario", "Comercio internacional"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el dinero?", opciones: ["Medio de intercambio", "Solo billetes", "Producto", "Servicio"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la inflación?", opciones: ["Aumento general de precios", "Baja de precios", "Estabilidad", "Tipo de interés"], respuesta: 0, dificultad: "media" },
        { texto: "Explica diferencia entre micro y macroeconomía", opciones: ["Micro: individuos; Macro: país", "Iguales", "Al revés", "No relacionado"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es un banco?", opciones: ["Institución financiera", "Tienda", "Fábrica", "Escuela"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el PIB?", opciones: ["Producto Interno Bruto", "Precio Individual Base", "Programa Internacional Bancario", "Proceso Interno Básico"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el ahorro?", opciones: ["Guardar dinero para futuro", "Gastar todo", "Pedir prestado", "Invertir sin plan"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el desempleo?", opciones: ["Personas sin trabajo", "Trabajo informal", "Trabajo temporal", "Jubilación"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el comercio?", opciones: ["Intercambio de bienes", "Solo exportación", "Solo importación", "Producción"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un impuesto?", opciones: ["Contribución al estado", "Préstamo", "Ahorro", "Inversión"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 16,
      categoria: "Cívica",
      preguntas: [
        { texto: "¿Qué es la democracia?", opciones: ["Gobierno del pueblo", "Dictadura", "Monarquía", "Anarquía"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la Constitución?", opciones: ["Ley fundamental de un país", "Ley menor", "Reglamento escolar", "Contrato privado"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué son los derechos humanos?", opciones: ["Derechos básicos de todas las personas", "Privilegios", "Leyes locales", "Costumbres"], respuesta: 0, dificultad: "media" },
        { texto: "Explica la separación de poderes", opciones: ["Ejecutivo, Legislativo, Judicial", "Solo un poder", "Poder militar", "Poder económico"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es un ciudadano?", opciones: ["Miembro de un estado con derechos", "Extranjero", "Menor de edad", "Animal"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el voto?", opciones: ["Derecho a elegir gobernantes", "Obligación", "Impuesto", "Castigo"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la justicia?", opciones: ["Dar a cada uno lo que merece", "Venganza", "Favoritismo", "Ignorancia"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la libertad?", opciones: ["Capacidad de actuar sin coerción", "Hacer lo que sea", "Esclavitud", "Obligación"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la igualdad?", opciones: ["Mismos derechos y oportunidades", "Ser idénticos", "Desigualdad", "Privilegio"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la responsabilidad?", opciones: ["Cumplir con obligaciones", "Ignorar deberes", "Derecho sin límite", "Libertad absoluta"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 17,
      categoria: "Psicología",
      preguntas: [
        { texto: "¿Qué estudia la psicología?", opciones: ["Mente y comportamiento", "Solo enfermedades", "Cuerpo físico", "Animales"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la memoria?", opciones: ["Capacidad de almacenar información", "Olvido", "Sueño", "Hambre"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la inteligencia emocional?", opciones: ["Manejar emociones propias y ajenas", "Solo coeficiente intelectual", "Memoria", "Velocidad"], respuesta: 0, dificultad: "media" },
        { texto: "Explica el inconsciente según Freud", opciones: ["Parte de la mente con deseos ocultos", "Conciencia plena", "Memoria inmediata", "Razonamiento"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es el estrés?", opciones: ["Respuesta a presión", "Enfermedad física", "Felicidad", "Relajación"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la autoestima?", opciones: ["Valoración de sí mismo", "Comparación con otros", "Fama", "Riqueza"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la comunicación?", opciones: ["Intercambio de información", "Solo hablar", "Escuchar", "Silencio"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la empatía?", opciones: ["Ponerse en lugar del otro", "Indiferencia", "Egoísmo", "Crítica"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el aprendizaje?", opciones: ["Adquisición de conocimientos", "Olvido", "Nacimiento", "Envejecimiento"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la motivación?", opciones: ["Impulso para actuar", "Pereza", "Miedo", "Indiferencia"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 18,
      categoria: "Matemáticas",
      preguntas: [
        { texto: "¿Cuánto es 15 ÷ 3?", opciones: ["3", "5", "10", "15"], respuesta: 1, dificultad: "fácil" },
        { texto: "Resuelve: 2(x + 3) = 10", opciones: ["x = 1", "x = 2", "x = 3", "x = 4"], respuesta: 1, dificultad: "media" },
        { texto: "¿Cuál es el perímetro de un cuadrado de lado 5?", opciones: ["10", "15", "20", "25"], respuesta: 2, dificultad: "fácil" },
        { texto: "Resuelve: √64", opciones: ["6", "7", "8", "9"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Cuántos lados tiene un hexágono?", opciones: ["4", "5", "6", "7"], respuesta: 2, dificultad: "fácil" },
        { texto: "¿Qué es una fracción?", opciones: ["Parte de un todo", "Número entero", "Número decimal", "Número negativo"], respuesta: 0, dificultad: "fácil" },
        { texto: "Resuelve: 5²", opciones: ["10", "15", "20", "25"], respuesta: 3, dificultad: "fácil" },
        { texto: "¿Cuántos grados tiene un ángulo recto?", opciones: ["45°", "90°", "180°", "360°"], respuesta: 1, dificultad: "fácil" },
        { texto: "¿Qué es el diámetro?", opciones: ["Línea que pasa por el centro del círculo", "Radio", "Circunferencia", "Área"], respuesta: 0, dificultad: "media" },
        { texto: "Resuelve: 0.5 × 8", opciones: ["2", "4", "6", "8"], respuesta: 1, dificultad: "fácil" }
      ]
    },
    {
      id: 19,
      categoria: "Ciencias Naturales",
      preguntas: [
        { texto: "¿Qué es el sistema solar?", opciones: ["Sol y planetas", "Solo la Tierra", "Galaxia", "Estrellas lejanas"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué animal es mamífero?", opciones: ["Ballena", "Tiburón", "Lagarto", "Rana"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la energía?", opciones: ["Capacidad para realizar trabajo", "Materia", "Peso", "Volumen"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué son los minerales?", opciones: ["Sustancias inorgánicas naturales", "Plantas", "Animales", "Líquidos"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el ciclo del agua?", opciones: ["Evaporación, condensación, precipitación", "Solo lluvia", "Solo evaporación", "Congelamiento"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un vertebrado?", opciones: ["Animal con columna vertebral", "Animal sin huesos", "Planta", "Insecto"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la Luna?", opciones: ["Satélite natural de la Tierra", "Planeta", "Estrella", "Cometa"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una célula?", opciones: ["Unidad básica de la vida", "Órgano", "Tejido", "Sistema"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un insecto?", opciones: ["Animal con 6 patas", "Animal con 4 patas", "Pequeño mamífero", "Pájaro"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la digestión?", opciones: ["Proceso de descomponer alimentos", "Respiración", "Circulación", "Excreción"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 20,
      categoria: "Historia",
      preguntas: [
        { texto: "¿Quién descubrió América?", opciones: ["Cristóbal Colón", "Américo Vespucio", "Marco Polo", "Hernán Cortés"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Dónde surgió la civilización maya?", opciones: ["Mesoamérica", "Europa", "Asia", "África"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué fue la Revolución Industrial?", opciones: ["Cambio a producción mecanizada", "Revolución política", "Cambio agrícola", "Guerra mundial"], respuesta: 0, dificultad: "media" },
        { texto: "¿Quién fue Napoleón Bonaparte?", opciones: ["Emperador francés", "Rey español", "Presidente americano", "Explorador portugués"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué fue la Edad Media?", opciones: ["Período entre antigüedad y renacimiento", "Edad moderna", "Prehistoria", "Edad contemporánea"], respuesta: 0, dificultad: "media" },
        { texto: "¿Quiénes fueron los vikingos?", opciones: ["Pueblos nórdicos exploradores", "Tribus africanas", "Civilización asiática", "Imperio americano"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué fue el Renacimiento?", opciones: ["Renacer del arte y ciencia", "Edad oscura", "Revolución industrial", "Guerra mundial"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Quién fue Cleopatra?", opciones: ["Última reina de Egipto", "Emperatriz romana", "Reina española", "Guerrera griega"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué fue la Guerra de Independencia de Estados Unidos?", opciones: ["Liberación del dominio británico", "Guerra civil", "Guerra mundial", "Revolución francesa"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Quién fue Gandhi?", opciones: ["Líder independentista indio", "Rey inglés", "Presidente americano", "Científico alemán"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 21,
      categoria: "Geografía",
      preguntas: [
        { texto: "¿Cuál es el océano más grande?", opciones: ["Pacífico", "Atlántico", "Índico", "Ártico"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un continente?", opciones: ["Gran masa de tierra", "País", "Ciudad", "Océano"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Dónde está la cordillera del Himalaya?", opciones: ["Asia", "América", "Europa", "África"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el clima tropical?", opciones: ["Cálido y húmedo", "Frío y seco", "Templado", "Polar"], respuesta: 0, dificultad: "media" },
        { texto: "¿Cuál es la capital de Japón?", opciones: ["Tokio", "Pekín", "Seúl", "Bangkok"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un volcán?", opciones: ["Abertura en corteza terrestre", "Montaña normal", "Colina", "Valle"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Dónde está el Amazonas?", opciones: ["América del Sur", "África", "Asia", "Australia"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un mapa?", opciones: ["Representación de territorio", "Fotografía", "Pintura abstracta", "Gráfico estadístico"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la población?", opciones: ["Conjunto de habitantes", "Solo adultos", "Solo niños", "Animales"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la erosión?", opciones: ["Desgaste del suelo", "Formación de montañas", "Creación de ríos", "Erupción volcánica"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 22,
      categoria: "Lenguaje",
      preguntas: [
        { texto: "¿Qué es un adjetivo?", opciones: ["Palabra que describe", "Palabra que nombra", "Palabra que indica acción", "Palabra que enlaza"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una oración?", opciones: ["Conjunto de palabras con sentido completo", "Palabra suelta", "Signo de puntuación", "Acento"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una novela?", opciones: ["Narrativa extensa", "Poema corto", "Artículo periodístico", "Carta"], respuesta: 0, dificultad: "media" },
        { texto: "¿Quién escribió 'Don Quijote'?", opciones: ["Cervantes", "García Márquez", "Borges", "Neruda"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un pronombre?", opciones: ["Palabra que reemplaza sustantivo", "Palabra que describe", "Palabra que indica acción", "Palabra que enlaza"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la poesía?", opciones: ["Expresión literaria con ritmo", "Texto científico", "Noticia periodística", "Manual técnico"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un cuento?", opciones: ["Narrativa breve", "Novela larga", "Ensayo", "Drama teatral"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la comunicación oral?", opciones: ["Hablar y escuchar", "Solo escribir", "Solo leer", "Pensar"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una carta?", opciones: ["Texto para enviar mensaje", "Novela", "Poema", "Artículo"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un diálogo?", opciones: ["Conversación entre personas", "Monólogo", "Descripción", "Narración"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 23,
      categoria: "Inglés",
      preguntas: [
        { texto: "What is 'dog' in Spanish?", opciones: ["Perro", "Gato", "Casa", "Libro"], respuesta: 0, dificultad: "fácil" },
        { texto: "How do you say 'gracias' in English?", opciones: ["Thank you", "Please", "Sorry", "Hello"], respuesta: 0, dificultad: "fácil" },
        { texto: "What is the plural of 'book'?", opciones: ["books", "bookes", "bookies", "booken"], respuesta: 0, dificultad: "fácil" },
        { texto: "What is 'to be' in present?", opciones: ["am, is, are", "was, were", "be, been", "being"], respuesta: 0, dificultad: "media" },
        { texto: "What does 'computer' mean?", opciones: ["Computadora", "Televisor", "Radio", "Teléfono"], respuesta: 0, dificultad: "fácil" },
        { texto: "What is the past of 'eat'?", opciones: ["ate", "eated", "eaten", "eating"], respuesta: 0, dificultad: "media" },
        { texto: "What is a 'verb'?", opciones: ["Action word", "Naming word", "Describing word", "Connecting word"], respuesta: 0, dificultad: "media" },
        { texto: "What is 'school' in Spanish?", opciones: ["Escuela", "Casa", "Parque", "Tienda"], respuesta: 0, dificultad: "fácil" },
        { texto: "What is 'family'?", opciones: ["Familia", "Amigos", "Vecinos", "Compañeros"], respuesta: 0, dificultad: "fácil" },
        { texto: "What is the present continuous of 'study'?", opciones: ["studying", "studied", "studies", "studyed"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 24,
      categoria: "Física",
      preguntas: [
        { texto: "¿Qué es la masa?", opciones: ["Cantidad de materia", "Peso", "Volumen", "Densidad"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la velocidad?", opciones: ["Distancia por tiempo", "Tiempo por distancia", "Masa por aceleración", "Fuerza por área"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la energía potencial?", opciones: ["Energía por posición", "Energía por movimiento", "Energía térmica", "Energía eléctrica"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la luz?", opciones: ["Onda electromagnética", "Partícula sólida", "Sonido", "Calor"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es el sonido?", opciones: ["Onda mecánica", "Luz", "Calor", "Electricidad"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la gravedad?", opciones: ["Fuerza de atracción", "Fuerza de repulsión", "Energía", "Materia"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un imán?", opciones: ["Objeto con campo magnético", "Metal conductor", "Aislante", "Cristal"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la temperatura?", opciones: ["Medida del calor", "Medida del frío", "Medida del peso", "Medida del volumen"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la presión?", opciones: ["Fuerza por área", "Masa por volumen", "Tiempo por distancia", "Energía por tiempo"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el movimiento?", opciones: ["Cambio de posición", "Reposo", "Equilibrio", "Estática"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 25,
      categoria: "Química",
      preguntas: [
        { texto: "¿Qué es un elemento?", opciones: ["Sustancia pura", "Mezcla", "Compuesto", "Disolución"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una molécula?", opciones: ["Grupo de átomos", "Átomo solo", "Ion", "Electrón"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la combustión?", opciones: ["Reacción con oxígeno", "Disolución", "Precipitación", "Sublimación"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el agua?", opciones: ["H₂O", "CO₂", "NaCl", "O₂"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un ácido?", opciones: ["Sustancia con pH bajo", "Sustancia con pH alto", "Sustancia neutra", "Sustancia salina"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es un metal?", opciones: ["Elemento conductor", "Elemento no conductor", "Gas", "Líquido"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la tabla periódica?", opciones: ["Organización de elementos", "Lista de compuestos", "Tabla de mezclas", "Catálogo de reacciones"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un compuesto?", opciones: ["Sustancia de varios elementos", "Elemento puro", "Mezcla", "Disolución"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la materia?", opciones: ["Todo lo que ocupa espacio", "Solo sólidos", "Solo líquidos", "Solo gases"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un cambio químico?", opciones: ["Transformación de sustancias", "Cambio de estado", "Cambio de forma", "Cambio de tamaño"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 26,
      categoria: "Biología",
      preguntas: [
        { texto: "¿Qué son las plantas?", opciones: ["Seres vivos fotosintéticos", "Animales", "Hongos", "Bacterias"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la fotosíntesis?", opciones: ["Proceso de hacer alimento con luz", "Respiración", "Digestión", "Circulación"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué son los animales?", opciones: ["Seres vivos consumidores", "Plantas", "Hongos", "Bacterias"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el ADN?", opciones: ["Material genético", "Proteína", "Carbohidrato", "Lípido"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es una célula?", opciones: ["Unidad básica de vida", "Tejido", "Órgano", "Sistema"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué son los mamíferos?", opciones: ["Animales con pelo y mamas", "Aves", "Peces", "Reptiles"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el sistema digestivo?", opciones: ["Procesa alimentos", "Transporta sangre", "Intercambia gases", "Elimina desechos"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué son los microorganismos?", opciones: ["Seres vivos microscópicos", "Plantas grandes", "Animales grandes", "Hongos visibles"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la reproducción?", opciones: ["Crear nuevos individuos", "Alimentarse", "Crecer", "Moverse"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un ecosistema?", opciones: ["Comunidad y ambiente", "Solo animales", "Solo plantas", "Solo agua"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 27,
      categoria: "Educación Física",
      preguntas: [
        { texto: "¿Para qué sirve el calentamiento?", opciones: ["Prevenir lesiones", "Cansarse más", "Perder tiempo", "Sudar menos"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el estiramiento?", opciones: ["Alargar músculos", "Contraer músculos", "Descansar", "Correr"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué deporte usa balón?", opciones: ["Fútbol", "Atletismo", "Natación", "Ciclismo"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la resistencia?", opciones: ["Capacidad de esfuerzo prolongado", "Fuerza máxima", "Velocidad", "Flexibilidad"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la velocidad?", opciones: ["Moverse rápido", "Moverse lento", "Quedarse quieto", "Saltar alto"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el fair play?", opciones: ["Juego limpio", "Hacer trampa", "Ganar siempre", "Perder sin intentar"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la coordinación?", opciones: ["Movimientos armónicos", "Movimientos desordenados", "Fuerza bruta", "Rapidez pura"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la hidratación?", opciones: ["Tomar agua", "Comer mucho", "Dormir", "Descansar"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un equipo?", opciones: ["Grupo que trabaja junto", "Persona sola", "Rival", "Espectador"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la salud?", opciones: ["Bienestar físico y mental", "Solo no enfermar", "Solo ser fuerte", "Solo ser rápido"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 28,
      categoria: "Arte",
      preguntas: [
        { texto: "¿Qué son colores primarios?", opciones: ["Rojo, azul, amarillo", "Verde, naranja, morado", "Blanco, negro, gris", "Todos"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un pincel?", opciones: ["Herramienta para pintar", "Tipo de lienzo", "Color", "Estilo"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una pintura?", opciones: ["Obra con colores sobre superficie", "Escultura", "Dibujo a lápiz", "Fotografía"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Quién fue Picasso?", opciones: ["Pintor español", "Escultor italiano", "Músico alemán", "Escritor francés"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es el dibujo?", opciones: ["Representación con líneas", "Pintura con colores", "Escultura en volumen", "Fotografía con cámara"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la escultura?", opciones: ["Arte tridimensional", "Pintura plana", "Dibujo lineal", "Fotografía digital"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es un museo?", opciones: ["Lugar para exhibir arte", "Taller de artista", "Casa particular", "Tienda de materiales"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la creatividad?", opciones: ["Crear ideas originales", "Copiar obras", "Seguir reglas", "Memorizar técnicas"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un retrato?", opciones: ["Representación de persona", "Paisaje", "Naturaleza muerta", "Abstracto"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el arte abstracto?", opciones: ["No representa realidad reconocible", "Realismo extremo", "Copia exacta", "Solo blanco y negro"], respuesta: 0, dificultad: "media" }
      ]
    },
    {
      id: 29,
      categoria: "Música",
      preguntas: [
        { texto: "¿Cuántas notas tiene la escala musical?", opciones: ["7", "5", "12", "10"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué instrumento es de cuerda?", opciones: ["Violín", "Trompeta", "Batería", "Flauta"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es una canción?", opciones: ["Composición musical con voz", "Solo instrumentos", "Ruido", "Silencio"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el ritmo?", opciones: ["Patrón de tiempos", "Melodía", "Armonía", "Volumen"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un concierto?", opciones: ["Presentación musical en vivo", "Ensayo privado", "Grabación en estudio", "Clase de música"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué instrumento es de viento?", opciones: ["Saxofón", "Piano", "Guitarra", "Violonchelo"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la melodía?", opciones: ["Sucesión de notas", "Ritmo", "Armonía", "Dinámica"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un coro?", opciones: ["Grupo de cantantes", "Solista", "Instrumentista", "Director"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es el solfeo?", opciones: ["Lectura musical cantando", "Tocar piano", "Componer", "Dirigir"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un género musical?", opciones: ["Estilo de música", "Instrumento", "Nota", "Ritmo específico"], respuesta: 0, dificultad: "fácil" }
      ]
    },
    {
      id: 30,
      categoria: "Filosofía",
      preguntas: [
        { texto: "¿Qué significa 'filosofía'?", opciones: ["Amor a la sabiduría", "Odio al conocimiento", "Ciencia exacta", "Arte visual"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Quién fue Platón?", opciones: ["Filósofo griego", "Rey romano", "Científico", "Artista"], respuesta: 0, dificultad: "fácil" },
        { texto: "¿Qué es la ética?", opciones: ["Estudio del bien y mal", "Matemática", "Física", "Biología"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la lógica?", opciones: ["Estudio del razonamiento", "Estudio de emociones", "Estudio del arte", "Estudio de la historia"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la metafísica?", opciones: ["Estudio de la realidad fundamental", "Estudio de números", "Estudio de plantas", "Estudio de animales"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Quién dijo 'Solo sé que no sé nada'?", opciones: ["Sócrates", "Platón", "Aristóteles", "Descartes"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es un dilema moral?", opciones: ["Situación con opciones conflictivas", "Problema matemático", "Acertijo", "Enigma histórico"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la libertad?", opciones: ["Capacidad de elegir", "Obligación", "Destino", "Determinismo"], respuesta: 0, dificultad: "media" },
        { texto: "¿Qué es la verdad?", opciones: ["Correspondencia con realidad", "Opinión personal", "Creencia", "Suposición"], respuesta: 0, dificultad: "difícil" },
        { texto: "¿Qué es la razón?", opciones: ["Facultad de pensar", "Emoción", "Instinto", "Intuición"], respuesta: 0, dificultad: "media" }
      ]
    }
  ],

  getExamenAleatorio: function() {
    const randomIndex = Math.floor(Math.random() * this.examenes.length);
    return this.examenes[randomIndex];
  },

  getExamenPorCategoria: function(categoria) {
    return this.examenes.find(examen => 
      examen.categoria.toLowerCase() === categoria.toLowerCase()
    ) || this.getExamenAleatorio();
  },

  listarCategorias: function() {
    return this.categorias.join(', ');
  }
};

// ========== VARIABLES GLOBALES ==========
const usuarios = new Map();

// ========== FUNCIÓN PRINCIPAL DEL BOT ==========
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log('Conexión cerrada, reconectando...', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot de Exámenes Escolares conectado');
      console.log('📚 30 exámenes | 17 categorías | 10 preguntas cada uno');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || 
                 msg.message.imageMessage?.caption || '';
    const sender = msg.key.remoteJid;

    if (!usuarios.has(sender)) {
      usuarios.set(sender, { examenActual: null, respuestas: [], puntaje: 0 });
    }

    const usuario = usuarios.get(sender);

    if (text.startsWith('!')) {
      const args = text.slice(1).split(' ');
      const comando = args[0].toLowerCase();

      if (comando === 'ayuda' || comando === 'help') {
        await sock.sendMessage(sender, {
          text: `📚 *BOT DE EXÁMENES ESCOLARES*\n\n` +
                `*Comandos disponibles:*\n` +
                `!ayuda - Muestra este mensaje\n` +
                `!categorias - Lista todas las categorías\n` +
                `!examen - Examen aleatorio\n` +
                `!examen [categoría] - Examen específico\n` +
                `!respuesta [números separados por comas] - Enviar respuestas\n` +
                `!puntaje - Ver tu puntaje actual\n` +
                `!top - Ver ranking de mejores puntajes\n\n` +
                `*Ejemplos:*\n` +
                `!examen Matemáticas\n` +
                `!respuesta 1,2,3,4,1,2,3,4,1,2`
        });
      }

      else if (comando === 'categorias') {
        await sock.sendMessage(sender, {
          text: `📖 *CATEGORÍAS DISPONIBLES:*\n${examenesDB.listarCategorias()}\n\n` +
                `Usa: !examen [categoría] para elegir una`
        });
      }

      else if (comando === 'examen') {
        let examen;
        if (args.length > 1) {
          const categoria = args.slice(1).join(' ');
          examen = examenesDB.getExamenPorCategoria(categoria);
        } else {
          examen = examenesDB.getExamenAleatorio();
        }

        usuario.examenActual = examen;
        usuario.respuestas = [];

        let mensaje = `📝 *EXAMEN #${examen.id}: ${examen.categoria}*\n\n`;
        mensaje += `*Instrucciones:*\n`;
        mensaje += `• Cada pregunta tiene 4 opciones (1-4)\n`;
        mensaje += `• Responde con el número de la opción correcta\n`;
        mensaje += `• Ejemplo: 1,2,3,4,1,2,3,4,1,2\n\n`;
        mensaje += `*Preguntas:*\n\n`;

        examen.preguntas.forEach((pregunta, index) => {
          mensaje += `*${index + 1}. (${pregunta.dificultad}) ${pregunta.texto}*\n`;
          pregunta.opciones.forEach((opcion, i) => {
            mensaje += `   ${i + 1}. ${opcion}\n`;
          });
          mensaje += `\n`;
        });

        mensaje += `\n📤 *Envía tus respuestas con:*\n`;
        mensaje += `!respuesta [tus respuestas separadas por comas]\n`;
        mensaje += `Ejemplo: !respuesta 1,2,3,4,1,2,3,4,1,2`;

        await sock.sendMessage(sender, { text: mensaje });
      }

      else if (comando === 'respuesta') {
        if (!usuario.examenActual) {
          await sock.sendMessage(sender, {
            text: `❌ Primero inicia un examen con !examen`
          });
          return;
        }

        if (args.length < 2) {
          await sock.sendMessage(sender, {
            text: `❌ Formato incorrecto. Usa: !respuesta 1,2,3,4,1,2,3,4,1,2`
          });
          return;
        }

        const respuestasUsuario = args[1].split(',').map(r => parseInt(r.trim()) - 1);
        
        if (respuestasUsuario.length !== usuario.examenActual.preguntas.length) {
          await sock.sendMessage(sender, {
            text: `❌ Debes enviar exactamente ${usuario.examenActual.preguntas.length} respuestas`
          });
          return;
        }

        let correctas = 0;
        let resultados = `📊 *RESULTADOS DEL EXAMEN: ${usuario.examenActual.categoria}*\n\n`;

        usuario.examenActual.preguntas.forEach((pregunta, index) => {
          const respuestaUsuario = respuestasUsuario[index];
          const esCorrecta = respuestaUsuario === pregunta.respuesta;
          
          if (esCorrecta) {
            correctas++;
            resultados += `✅ P${index + 1}: Correcto\n`;
          } else {
            resultados += `❌ P${index + 1}: Incorrecto\n`;
            resultados += `   Correcta: ${pregunta.respuesta + 1}. ${pregunta.opciones[pregunta.respuesta]}\n`;
          }
        });

        const porcentaje = Math.round((correctas / usuario.examenActual.preguntas.length) * 100);
        usuario.puntaje += correctas;

        resultados += `\n🎯 *RESUMEN:*\n`;
        resultados += `• Correctas: ${correctas}/${usuario.examenActual.preguntas.length}\n`;
        resultados += `• Porcentaje: ${porcentaje}%\n`;
        resultados += `• Puntaje acumulado: ${usuario.puntaje}\n\n`;

        if (porcentaje >= 80) {
          resultados += `🏆 ¡Excelente trabajo! 🎉`;
        } else if (porcentaje >= 60) {
          resultados += `👍 Bien hecho, sigue practicando`;
        } else {
          resultados += `📚 Sigue estudiando, puedes mejorar`;
        }

        await sock.sendMessage(sender, { text: resultados });
        usuario.examenActual = null;
      }

      else if (comando === 'puntaje') {
        await sock.sendMessage(sender, {
          text: `📈 *TU PUNTAJE ACTUAL:*\n` +
                `Total: ${usuario.puntaje} puntos\n` +
                `Exámenes completados: ${usuario.puntaje / 10}`
        });
      }

      else if (comando === 'top') {
        let top = Array.from(usuarios.entries())
          .filter(([id, user]) => user.puntaje > 0)
          .sort((a, b) => b[1].puntaje - a[1].puntaje)
          .slice(0, 10);

        let mensajeTop = `🏆 *TOP 10 PUNTAJES*\n\n`;
        
        if (top.length === 0) {
          mensajeTop += `No hay puntajes registrados aún. ¡Comienza con !examen!`;
        } else {
          top.forEach(([id, user], index) => {
            const numero = id.split('@')[0];
            const nombre = numero.slice(-4);
            mensajeTop += `${index + 1}. ${nombre}... - ${user.puntaje} pts\n`;
          });
        }

        await sock.sendMessage(sender, { text: mensajeTop });
      }
    }
  });
}

// ========== HANDLER PARA GDL-BOT/MIKU-BOT ==========
const handler = async (m, { conn, text, usedPrefix, command }) => {
  const sender = m.sender;
  
  if (!usuarios.has(sender)) {
    usuarios.set(sender, { examenActual: null, respuestas: [], puntaje: 0 });
  }
  
  const usuario = usuarios.get(sender);

  if (command === 'ayudaexamen' || command === 'help') {
    const helpText = `📚 *BOT DE EXÁMENES ESCOLARES*\n\n` +
      `*Comandos disponibles:*\n` +
      `• ${usedPrefix}categorias - Lista todas las categorías\n` +
      `• ${usedPrefix}examen - Examen aleatorio\n` +
      `• ${usedPrefix}examen [categoría] - Examen específico\n` +
      `• ${usedPrefix}respuesta [números] - Enviar respuestas\n` +
      `• ${usedPrefix}puntaje - Ver tu puntaje\n` +
      `• ${usedPrefix}top - Ranking de mejores\n\n` +
      `*Ejemplo:*\n` +
      `${usedPrefix}examen Matemáticas\n` +
      `${usedPrefix}respuesta 1,2,3,4,1,2,3,4,1,2`;
    
    await m.reply(helpText);
  }

  else if (command === 'categorias') {
    const categorias = examenesDB.listarCategorias();
    await m.reply(`📖 *CATEGORÍAS DISPONIBLES:*\n${categorias}\n\nUsa: ${usedPrefix}examen [categoría]`);
  }

  else if (command === 'examen') {
    let examen;
    if (text) {
      examen = examenesDB.getExamenPorCategoria(text);
    } else {
      examen = examenesDB.getExamenAleatorio();
    }

    usuario.examenActual = examen;
    usuario.respuestas = [];

    let mensaje = `📝 *EXAMEN #${examen.id}: ${examen.categoria}*\n\n`;
    mensaje += `*Instrucciones:*\n`;
    mensaje += `• Responde con el número de la opción correcta\n`;
    mensaje += `• Ejemplo: 1,2,3,4,1,2,3,4,1,2\n\n`;
    mensaje += `*Preguntas:*\n\n`;

    examen.preguntas.forEach((pregunta, index) => {
      mensaje += `*${index + 1}. (${pregunta.dificultad}) ${pregunta.texto}*\n`;
      pregunta.opciones.forEach((opcion, i) => {
        mensaje += `   ${i + 1}. ${opcion}\n`;
      });
      mensaje += `\n`;
    });

    mensaje += `\n📤 *Envía tus respuestas con:*\n`;
    mensaje += `${usedPrefix}respuesta [tus respuestas]\n`;
    mensaje += `Ejemplo: ${usedPrefix}respuesta 1,2,3,4,1,2,3,4,1,2`;

    await m.reply(mensaje);
  }

  else if (command === 'respuesta') {
    if (!usuario.examenActual) {
      await m.reply(`❌ Primero inicia un examen con ${usedPrefix}examen`);
      return;
    }

    if (!text) {
      await m.reply(`❌ Formato: ${usedPrefix}respuesta 1,2,3,4,1,2,3,4,1,2`);
      return;
    }

    const respuestasUsuario = text.split(',').map(r => parseInt(r.trim()) - 1);
    
    if (respuestasUsuario.length !== usuario.examenActual.preguntas.length) {
      await m.reply(`❌ Debes enviar ${usuario.examenActual.preguntas.length} respuestas`);
      return;
    }

    let correctas = 0;
    let resultados = `📊 *RESULTADOS: ${usuario.examenActual.categoria}*\n\n`;

    usuario.examenActual.preguntas.forEach((pregunta, index) => {
      const respuestaUsuario = respuestasUsuario[index];
      const esCorrecta = respuestaUsuario === pregunta.respuesta;
      
      if (esCorrecta) {
        correctas++;
        resultados += `✅ P${index + 1}: Correcto\n`;
      } else {
        resultados += `❌ P${index + 1}: Incorrecto\n`;
        resultados += `   Correcta: ${pregunta.respuesta + 1}. ${pregunta.opciones[pregunta.respuesta]}\n`;
      }
    });

    const porcentaje = Math.round((correctas / usuario.examenActual.preguntas.length) * 100);
    usuario.puntaje += correctas;

    resultados += `\n🎯 *RESUMEN:*\n`;
    resultados += `• Correctas: ${correctas}/${usuario.examenActual.preguntas.length}\n`;
    resultados += `• Porcentaje: ${porcentaje}%\n`;
    resultados += `• Puntaje total: ${usuario.puntaje}\n\n`;

    if (porcentaje >= 80) {
      resultados += `🏆 ¡Excelente! 🎉`;
    } else if (porcentaje >= 60) {
      resultados += `👍 Bien hecho`;
    } else {
      resultados += `📚 Sigue practicando`;
    }

    await m.reply(resultados);
    usuario.examenActual = null;
  }

  else if (command === 'puntaje') {
    await m.reply(`📈 *TU PUNTAJE:*\nTotal: ${usuario.puntaje} puntos`);
  }

  else if (command === 'top') {
    let top = Array.from(usuarios.entries())
      .filter(([id, user]) => user.puntaje > 0)
      .sort((a, b) => b[1].puntaje - a[1].puntaje)
      .slice(0, 10);

    let mensajeTop = `🏆 *TOP 10 PUNTAJES*\n\n`;
    
    if (top.length === 0) {
      mensajeTop += `Aún no hay puntajes. ¡Usa ${usedPrefix}examen!`;
    } else {
      top.forEach(([id, user], index) => {
        const numero = id.split('@')[0];
        mensajeTop += `${index + 1}. ${numero.slice(-4)}... - ${user.puntaje} pts\n`;
      });
    }

    await m.reply(mensajeTop);
  }
};

handler.help = ['examen', 'categorias', 'respuesta', 'puntaje', 'top', 'ayudaexamen'];
handler.tags = ['educacion', 'juegos'];
handler.command = ['examen', 'categorias', 'respuesta', 'puntaje', 'top', 'ayudaexamen'];

// ========== INICIAR BOT SI SE EJECUTA DIRECTAMENTE ==========
if (import.meta.url === `file://${process.argv[1]}`) {
  connectToWhatsApp().catch(console.error);
}

// ========== EXPORTAR HANDLER ==========
export default handler;