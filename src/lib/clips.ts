import type { Clip } from "./types";
import { resolveClips, type RawClip } from "./parse";

/**
 * TUS CLIPS.
 *
 * Añade cada clip pegando su URL y la respuesta correcta. La plataforma
 * (YouTube o Twitch) se detecta sola a partir de la URL.
 *
 *   { url: "https://www.youtube.com/shorts/XXXX", answer: "Nombre del momento" }
 *
 * Formatos de URL admitidos:
 *   YouTube:  youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID
 *   Twitch:   twitch.tv/videos/VOD_ID   (VOD, necesario para el audio por tramos)
 *
 * Inicio del fragmento:
 *   - Se coge del parámetro `t` de la URL si existe (?t=90, ?t=1m30s, ?t=1h2m3s).
 *   - O puedes fijarlo con `start` en segundos: { url, answer, start: 642 }.
 *
 * Nota Twitch: un "clip" suelto (clips.twitch.tv/SLUG) NO permite controlar el
 * audio de forma progresiva. Usa la URL del VOD (twitch.tv/videos/ID) e indica
 * el segundo del momento con `t=` o `start`.
 *
 * Los ejemplos de abajo son de relleno: sustitúyelos por los tuyos.
 */
const RAW_CLIPS: RawClip[] = [
  //Videos youtube mele
  {
    url: "https://www.youtube.com/shorts/yeRiKHjAN14",
    answer: "publi. He PROGRAMADO un SISTEMA de MISIONES para mi videojuego",
  },
  {
    url: "https://www.youtube.com/shorts/jI6_W1Vy4gc",
    answer: "Así se PROGRAMA el CAMUFLAJE de MECCHA CHAMELEON",
  },
  {
    url: "https://www.youtube.com/shorts/WZHPl11EMyM",
    answer: "publi. Cómo BALANCEAR un JUEGO DE CARTAS que ya está publicado: Stats Remotas 🛜📈🎮",
  },
  {
    url: "https://www.youtube.com/shorts/jAriM1kfiF0",
    answer: "¿Merece la pena ESTUDIAR PROGRAMACIÓN en pleno 2026?",
  },
    {
    url: "https://www.youtube.com/shorts/s7CUNz3xsBY",
    answer: "El RTX de los videojuegos se puede PROGRAMAR sin motor gráfico",
  },
      {
    url: "https://www.youtube.com/shorts/T7cFNTUZtjQ",
    answer: "Este detalle estaba ARRUINANDO mi juego MULTIJUGADOR",
  },
      {
    url: "https://www.youtube.com/shorts/UorBD2xy9QM",
    answer: "¿¡Cómo funciona una universidad SIN HORARIOS FIJOS?!",
  },
      {
    url: "https://www.youtube.com/shorts/4HKO_mYsQx8",
    answer: "Me han invitado al CyL GAMES SHOW para dar una CHARLA sobre desarrollo de videojuegos",
  },
    {
    url: "https://www.youtube.com/shorts/2P32sbZEB1g",
    answer: "publi Día 8 CREANDO un VIDEOJUEGO con las IDEAS de mis seguidores",
  },
      {
    url: "https://www.youtube.com/shorts/VFNFx9Znw5o",
    answer: "Día 7 creando un VIDEOJUEGO con las IDEAS de mis SEGUIDORES",
  },
      {
    url: "https://www.youtube.com/shorts/rIUblpy-HXA",
    answer: "Día 6 creando un VIDEOJUEGO con las IDEAS de mis SEGUIDORES",
  },
      {
    url: "https://www.youtube.com/shorts/kK5ET8Q4bQQ",
    answer: "Cómo VIVIR del desarrollo de videojuegos sin PUBLICAR videojuegos",
  },
      {
    url: "https://www.youtube.com/shorts/IvWNNWfvwnw",
    answer: "Me han invitado a dar una CHARLA para desarrolladores de videojuegos en el evento 'PRESS START",
  },
        {
    url: "https://www.youtube.com/shorts/Cn4TeFLXmA0",
    answer: "¿Sabes para qué servía la NIEBLA de SILENT HILL para PS1?",
  },
        {
    url: "https://www.youtube.com/shorts/rTcDFa6CS6U",
    answer: "¿Merece la pena aprender programación en 2026?",
  },
        {
    url: "https://www.youtube.com/shorts/bRxNLN0NrbI",
    answer: "Cómo usar la IA para PROGRAMAR sin volverte TONTO",
  },
        {
    url: "https://www.youtube.com/shorts/G7XmzYzK8Bk",
    answer: "Los MUNDOS de los juegos MULTIJUGADOR no funcionan como crees",
  },
        {
    url: "https://www.youtube.com/shorts/qdPeS3dOWHE",
    answer: "Día 5 creando un VIDEOJUEGO con las IDEAS de mis SEGUIDORES",
  },
        {
    url: "https://www.youtube.com/shorts/ChmZ_osJLfE",
    answer: "¡Cuidado con los objetos TRANSPARENTES en tu videojuego!",
  },
        {
    url: "https://www.youtube.com/shorts/pv8Y-zzjS4E",
    answer: "Cómo se PROGRAMA el CAMPO DE VISIÓN de Among Us",
  },
        {
    url: "https://www.youtube.com/shorts/Q-Mgx1dH8ug",
    answer: "Si eres PROGRAMADOR debes conocer la COMPLEJIDAD ALGORÍTMICA",
  },
        {
    url: "https://www.youtube.com/shorts/RKUSWigCXe0",
    answer: "Mucho cuidado con la OPTIMIZACIÓN de los COLISIONADORES de tu juego",
  },
        {
    url: "https://www.youtube.com/shorts/AhYPiLMEqzk",
    answer: "Creamos el DISPARO para DESTRUIR al PATO",
  },
        {
    url: "https://www.youtube.com/shorts/c1IgVVJK5_Y",
    answer: "PROGRAMAMOS que el pato REBOTE en las paredes",
  },
        {
    url: "https://www.youtube.com/shorts/VeKR5z9aa7M",
    answer: "Así he programado el COMPORTAMIENTO del PATO de DUCK HUNT",
  },
        {
    url: "https://www.youtube.com/shorts/vtM-182VBB4",
    answer: "La mejor forma de EMPEZAR a crear JUEGOS MULTIJUGADOR en Unity",
  },
        {
    url: "https://www.youtube.com/shorts/nu0RAiiJy4Y",
    answer: "¿Cómo crearías NIVELES INFINITOS para mi VIDEOJUEGO?",
  },
        {
    url: "https://www.youtube.com/shorts/hirkDc0_2n0",
    answer: "El CÓDIGO SPAGHETTI está DESTRUYENDO tu juego",
  },
        {
    url: "https://www.youtube.com/shorts/xmcXgWbxGWU",
    answer: "Así está programado el MÓVIL / CELULAR de GTA V ",
  },
        {
    url: "https://www.youtube.com/shorts/fpt9GNsTtBs",
    answer: "¿Necesitas saber MATEMÁTICAS para poder PROGRAMAR videojuegos?",
  },
        {
    url: "https://www.youtube.com/shorts/mL5kDvCzuso",
    answer: "Busco EDITORES para mi canal",
  },
  {
    url: "https://www.youtube.com/shorts/-niI9OeyXmk",
    answer: "Deja de usar SINGLETON en tu código y empieza a usar INYECCIÓN de DEPENDENCIAS",
  },
  {
    url: "https://www.youtube.com/shorts/0b02m_yw46I",
    answer: "¿Qué es mejor para ser PROGRAMADOR? | Estudiar FP vs UNIVERSIDAD",
  },
    {
    url: "https://www.youtube.com/shorts/B0LSf3qXPF0",
    answer: "Cómo está programada Cappy y la mecánica de posesión de objetos de Mario Oddysey",
  },
    {
    url: "https://www.youtube.com/shorts/_boJqrQZRRM",
    answer: "MELENITAS SQUID GAMES (1º Edición) | Sígueme y deja un comentario para participar",
  },
    {
    url: "https://www.youtube.com/shorts/UjXLla928lY",
    answer: "Comienzan los MELENITAS SQUID GAMES | Sígueme y deja un comentario para participar",
  },
    {
    url: "https://www.youtube.com/shorts/lQigWxAuwyU",
    answer: "Día 4 creando un VIDEOJUEGO con las IDEAS de mis SEGUIDORES",
  },
    {
    url: "https://www.youtube.com/shorts/9KSfYtFoBds",
    answer: "Cómo se PROGRAMA el TERRENO DESTRUCTIBLE en un videojuego",
  },
    {
    url: "https://www.youtube.com/shorts/472mcAc76QA",
    answer: "He REFORMADO mi HABITACIÓN para convertirla en mi ESTUDIO SOÑADO",
  },
    {
    url: "https://www.youtube.com/shorts/hmTMl7iaF9A",
    answer: "¿Podrías crear un VIDEOJUEGO sin motor GRÁFICO? - Crea tu propia marca desde tu móvil",
  },
    {
    url: "https://www.youtube.com/shorts/OIpEfj1gU7c",
    answer: "#publi He programado un PATH FINDING para cualquier superficie usando PROGRAMACIÓN BÁSICA",
  },
    {
    url: "https://www.youtube.com/shorts/djY6-8VCOmo",
    answer: "#publi He añadido un LANZA NUECES de Plants vs Zombies al JUEGO con las IDEAS de mis SEGUIDORES",
  },
    {
    url: "https://www.youtube.com/shorts/BBPcQnpEwqg",
    answer: "#publi Día 5 creando mi MARCA de ROPA de PROGRAMACIÓN usando GELATO ",
  },
    {
    url: "https://www.youtube.com/shorts/YiqIP7bqRrg",
    answer: "He programado un MAPACHE LADRÓN para el juego con IDEAS de SEGUIDORES ",
  },
    {
    url: "https://www.youtube.com/shorts/obcyj4QTIWQ",
    answer: "Me han reportado un BUG rarísimo en SOUNDS GOOD 🐞🟧 ¿Se te ocurre cómo arreglarlo?",
  },
      {
    url: "https://www.youtube.com/shorts/pkzRv5MLxJw",
    answer: "#publi Ayudo a un artista a monetizar su trabajo",
  },
      {
    url: "https://www.youtube.com/shorts/pL1OtTZhh3E",
    answer: "¿¡Todavía no sabes lo que son las FUNCIONES TEMPLATIZADAS!? ",
  },
      {
    url: "https://www.youtube.com/shorts/Rw2iOQCvoZo",
    answer: "#publi Cuánto deberías COBRAR como PROGRAMADOR freelance - Te enseño a calcular tus tarifas ",
  },
      {
    url: "https://www.youtube.com/shorts/b7gRkUL2AqI",
    answer: "Cómo crear tu propio MERCHANDISING fácil y rápido ",
  },
      {
    url: "https://www.youtube.com/shorts/Wio85FkTbks",
    answer: "Este seguidor quiere que añada a MAZINGER Z en nuestro JUEGO",
  },
      {
    url: "https://www.youtube.com/shorts/3LLvYR46Itk",
    answer: "No vuelvas a usar FUNCIONES ASÍNCRONAS cuando PROGRAMAS sin conocer los CANCELLATION TOKENS",
  },
      {
    url: "https://www.youtube.com/shorts/RhZMo7Wi4TI",
    answer: "Este seguidor quiere que el siguiente nivel sea la NAVE de AMONG US",
  },
      {
    url: "https://www.youtube.com/shorts/XU2olkPLiXA",
    answer: "Día 4 creando mi MARCA DE ROPA para PROGRAMADORES",
  },
      {
    url: "https://www.youtube.com/shorts/jBUOfUEKE94",
    answer: "Día 3 creando un VIDEOJUEGO con las IDEAS de mis SEGUIDORES",
  },
        {
    url: "https://www.youtube.com/shorts/nkWgizaoAGo",
    answer: "He mejorado mi JUEGO de TERROR creado un sistema ESCALABLE usando CLEAN CODE",
  },
        {
    url: "https://www.youtube.com/shorts/0s2MxaZIztQ",
    answer: "¡Por fin he terminado mi CURSO de INICIACIÓN al DESARROLLO de VIDEOJUEGOS! ",
  },
        {
    url: "https://www.youtube.com/shorts/11xvkMm_vU8",
    answer: "Día 2 CREANDO un VIDEOJUEGO con vuestros COMENTARIOS",
  },
        {
    url: "https://www.youtube.com/shorts/RnH71-jC6ug",
    answer: "Día 3 creando mi MARCA DE ROPA para PROGRAMADORES",
  },
        {
    url: "https://www.youtube.com/shorts/ACBg8xbuf5c",
    answer: "Esta ha sido mi experiencia en el BCN Game Fest 2025",
  },
        {
    url: "https://www.youtube.com/shorts/_aI14dTqFYc",
    answer: "Día 1 CREANDO un VIDEOJUEGO con vuestros COMENTARIOS",
  },
        {
    url: "https://www.youtube.com/shorts/2jV-JZOo3mE",
    answer: "Día 2 creando mi MARCA DE ROPA para PROGRAMADORES",
  },
        {
    url: "https://www.youtube.com/shorts/KqSTPGKUCwE",
    answer: "Día 1 creando mi MARCA DE ROPA para PROGRAMADORES",
  },

    //Clips twitch mele
];

/**
 * CLIPS DE "PLAGIOS DEV" (modo aparte).
 *
 * Vídeos de YouTube que añades a mano aquí. Es una colección independiente de
 * RAW_CLIPS: solo aparecen en el modo "Plagios Dev", no en Twitch/YouTube/Mixto.
 * Mismo formato (URL + respuesta, con `t=` o `start` opcional).
 */
const PLAGIOS_DEV_CLIPS: RawClip[] = [
  //Videos rise
  {
    url: "https://www.youtube.com/watch?v=4zXKp7E_PgY&t=1s",
    answer: "Rise - Hice un juego que TE EST4FA cuando no estás mirando...",
  },
  {
    url: "https://youtu.be/1dcnka3yloo?si=2Ofl0mkFgB0uijhp",
    answer: "Rise - Tenía una semana para hacer bonito mi juego… O SI NO…",
  },
  {
    url: "https://youtu.be/GYaJMxmTJpk?si=gw0HnOVY4cvvuWom",
    answer: "Rise - Convertí mi ludopatía en un videojuego",
  },
  {
    url: "https://youtu.be/w-B6NNZYPCM?si=7IUryvko7ToYRiub",
    answer: "Rise - SOLO cambié un número… y REVENTÉ Clash Royale 3D",
  },
    {
    url: "https://youtu.be/Qd-TgxHJh7Y?si=6Ken1zbWIR8SgxwP",
    answer: "Rise - UNITY vs UNREAL haciendo un JUEGO de TERROR en 24 HORAS",
  },
    {
    url: "https://youtu.be/rx0weTRy214?si=M6k1B82c6wdqpJxO",
    answer: "Rise - Hice un JUEGO que SE DESTRUYE A SÍ MISMO",
  },
    {
    url: "https://www.youtube.com/watch?v=ew27GRf3B6M",
    answer: "Rise - EXPUSE un JUEGO HECHO EN 14 DÍAS frente a +25k PERSONAS",
  },
    {
    url: "https://youtu.be/-YlodX9Z418?si=i6Kn6JfByhyBoQBH",
    answer: "Rise - 9 DESARROLLADORES crean un JUEGO SIN PODER COMUNICARSE",
  },
    {
    url: "https://youtu.be/DE6TZsEg76Q?si=0WJu2k9bcs49LY8E",
    answer: "Rise - hice +1 MILLÓN de SKINS para mi VIDEOJUEGO SIN QUERER",
  },
    {
    url: "https://youtu.be/kRRAkE6vg5U?si=pS4yn0AF2iHm6BnO",
    answer: "Rise - La IA vs PROFESIONALES creando un videojuego SIN PODER COMUNICARSE",
  },
      {
    url: "https://www.youtube.com/watch?v=8W-Kdbl84Ro",
    answer: "Rise - CAMUFLÉ un VIDEOJUEGO de TERROR en uno COZY en 12h",
  },
      {
    url: "https://youtu.be/Cp1ZcOiRdbk?si=o2tqPPGG0gSTvTfj",
    answer: "Rise - hice un METROIDVANIA que te OBLIGA a ROBAR HABILIDADES",
  },
      {
    url: "https://youtu.be/LH7hkqEmJaY?si=OVTgPcq4wdQvoOqb",
    answer: "Rise - Hice GEOMETRY DASH en 4D y RTX en 24 HORAS | GODOT DEVLOG",
  },
      {
    url: "https://www.youtube.com/watch?v=Uodhptcfiww",
    answer: "Rise - Hice un Videojuego IMPOSIBLE SIN EXPERIENCIA en 48 HORAS | GODOT GAME JAM DEVLOG",
  },

    //Videos centus
  {
    url: "https://www.youtube.com/shorts/gwMYxKEZL2k",
    answer: "Centus - 🧩¿COMO SE GENERAN MUNDOS ALEATORIOS EN VIDEOJUEGOS? 🧩",
  },
  {
    url: "https://www.youtube.com/shorts/TOYNJHrE5hI",
    answer: "Centus - 🎮 COMO FUNCIONAN LOS HACKS EN VIDEOJUEGOS 🎮",
  },
  {
    url: "https://www.youtube.com/shorts/-KWaMM6R5FQ",
    answer: "Centus - 🎮 PANTALLAS DE CARGA OCULTAS EN VIDEOJUEGOS 🎮",
  },
  {
    url: "https://www.youtube.com/shorts/KxCypnCBWJo",
    answer: "Centus - 🔫 LOS SHOOTER TE ENGAÑAN 🔫",
  },
  {
    url: "https://www.youtube.com/shorts/tJ7SHSYt9Q0",
    answer: "Centus - 🔈 ¿COMO SABES DE DONDE TE VIENEN LAS BALAS EN SHOOTERS? 🔈",
  },
  {
    url: "https://www.youtube.com/shorts/Jm5UDzh4qYg",
    answer: "Centus - COMO SABEN TU POSICIÓN LOS JUEGOS DE CARRERAS",
  },
  {
    url: "https://www.youtube.com/shorts/2Ir1BYLsqFg",
    answer: "Centus - 🎨 COMO HACE MECCHACHAMELEON PARA PINTAR TU PERSONAJE 🎨",
  },
  {
    url: "https://www.youtube.com/shorts/9U1ieoJucFo",
    answer: "Centus - ¿TE VA A TIRONES LOS VIDEOJUEGOS?",
  },
  {
    url: "https://www.youtube.com/shorts/dH0ur4Le1pE",
    answer: "Centus - MI GANCHO ANTES VS DESPUÉS",
  },
  {
    url: "https://www.youtube.com/shorts/UD02lGAWtZo",
    answer: "Centus - 🌳 NECESITAS ESTÁ OPTIMIZACIÓN PARA TU VIDEOJUEGO 🌳",
  },
  {
    url: "https://www.youtube.com/shorts/hBbzJHANDOE",
    answer: "Centus - 🌳 ¿DESAPARECEN COSAS EN TUS VIDEOJUEGOS? 🌳",
  },
  {
    url: "https://www.youtube.com/shorts/XlkfYbP8f8M",
    answer: "Centus - 🪐EL SISTEMA DE GRAVEDAD DE OUTER WILDS Y MARIO GALAXY🪐",
  },
  {
    url: "https://www.youtube.com/shorts/JkB2BNfVncI",
    answer: "Centus - 🏓 LOS REMAKES SON DIFÍCILES DE HACER 🏓",
  },
  {
    url: "https://www.youtube.com/shorts/vBmlvAXfAC4",
    answer: "Centus - LEGO BATMAN HA CAMBIADO POR FIN...",
  },
  {
    url: "https://www.youtube.com/shorts/gk2WI8KWqSo",
    answer: "Centus - 💡MELENITAS DEV ME RETA A RECREAR LAS LUCES DE AMONG US 💡",
  },
  {
    url: "https://www.youtube.com/shorts/B3v2n6Hmmf4",
    answer: "Centus - ‼️ UNREAL ENGINE 6 ES REAL ‼️",
  },
  {
    url: "https://www.youtube.com/shorts/pMOxsOwffCk",
    answer: "Centus - ⏱️ FORZA HORIZON 6 CARGA EN SOLO 4 SEGUNDOS ⏱️",
  },
  {
    url: "https://www.youtube.com/shorts/n8868mp5FJc",
    answer: "Centus - 🤿 LUCES VOLUMÉTRICAS EN SUBNAUTICA 🤿",
  },
  {
    url: "https://www.youtube.com/shorts/Qu4aiPouAW4",
    answer: "Centus - ESTE EFECTO DE VIDEOJUEGOS ES SOLO UN TRUCO",
  },
  {
    url: "https://www.youtube.com/shorts/uiSyshrIEpM",
    answer: "Centus - ¿TOMODACHI LIFE ES ALEATORIO?",
  },
  {
    url: "https://www.youtube.com/shorts/nQNTxAY7Wrs",
    answer: "Centus - 📸 LOS VIDEOJUEGOS NO MUESTRAN TODO REALMENTE 📸",
  },
  {
    url: "https://www.youtube.com/shorts/7Ec57NmbqwE",
    answer: "Centus - 💻 ¡NO PONGAS ESTO EN EL UPDATE DE TU VIDEOJUEGO! 💻",
  },
  {
    url: "https://www.youtube.com/shorts/QMgCYqKySIw",
    answer: "Centus - 💬 DIA 5 HACIENDO UN VIDEOJUEGO CON VUESTROS COMENTARIOS 💬",
  },
  {
    url: "https://www.youtube.com/shorts/Y8oIMg7Aqyk",
    answer: "Centus - 🪞 LOS ESPEJOS EN LOS VIDEOJUEGOS TE MIENTEN 🪞",
  },
  {
    url: "https://www.youtube.com/shorts/Vlxir8Bb0hs",
    answer: "Centus - ¿PUEDES ABURRIRTE CON VIDEOJUEGOS DEMASIADO TRANQUILOS?",
  },
  {
    url: "https://www.youtube.com/shorts/p74_Atl-dcU",
    answer: "Centus - El chiste fue legendario...",
  },
  {
    url: "https://www.youtube.com/shorts/GHx6mb6VKkg",
    answer: "Centus - MEJORES HERRAMIENTAS PARA HACER VIDEOJUEGOS",
  },
  {
    url: "https://www.youtube.com/shorts/vq9pdL2k0dY",
    answer: "Centus - 💬 DÍA 4 HACIENDO UN VIDEOJUEGO CON VUESTROS COMENTARIOS 💬",
  },
  {
    url: "https://www.youtube.com/shorts/TXhLjtFIihU",
    answer: "Centus - 💥COMO FUNCIONAN LOS SHOOTERS 💥",
  },
  {
    url: "https://www.youtube.com/shorts/KWrnu2zJSOg",
    answer: "Centus - 🤖 LA MEJOR IA DE LOS VIDEOJUEGOS 🤖",
  },
  {
    url: "https://www.youtube.com/shorts/unY7M1eoDoY",
    answer: "Centus - ⌛UNITY VS UNREAL ENGINE EN 24 HORAS ⌛",
  },
  {
    url: "https://www.youtube.com/shorts/nC9hyFPPXlk",
    answer: "Centus - ¿ES NECESARIO JAVA PARA JUGAR MINECRAFT?",
  },
  {
    url: "https://www.youtube.com/shorts/RiRAlGpXJs4",
    answer: "Centus - ¿LOS DESARROLLADORES SOMOS SERIOS?",
  },
  {
    url: "https://www.youtube.com/shorts/PWtruhxLj-8",
    answer: "Centus - 🗡️ LA IA DE LEFT 4 DEAD 2 🗡️",
  },
  {
    url: "https://www.youtube.com/shorts/GUXo-9UQbYw",
    answer: "Centus - TUTORIAL UNITY WINDTRAIL - Legend of Zelda",
  },
  {
    url: "https://www.youtube.com/shorts/unkico-gJ_U",
    answer: "Centus - CREA MAPAS DE FANTASÍA FACIL Y GRATIS CON ESTO...",
  },
  {
    url: "https://www.youtube.com/shorts/YAn2JmLR_OM",
    answer: "Centus - JUEGOS HECHOS EN UNITY QUE NO SABÍAS 🎮",
  },
  {
    url: "https://www.youtube.com/shorts/PLlTPqTDSMY",
    answer: "Centus - LAS TEXTURAS EN VIDEOJUEGOS SON FEAS 🤢",
  },
  {
    url: "https://www.youtube.com/shorts/fMJTwI6w3z8",
    answer: "Centus - LA MEJOR IA EN VIDEOJUEGOS 🤖",
  },
  {
    url: "https://www.youtube.com/shorts/0ylip1h6J5s",
    answer: "Centus - Soy César y soy Desarrollador de Videojuegos 😋",
  },

];

export const CLIPS: Clip[] = [
  ...resolveClips(RAW_CLIPS).map((c) => ({ ...c, collection: "main" as const })),
  ...resolveClips(PLAGIOS_DEV_CLIPS).map((c) => ({
    ...c,
    collection: "plagiosdev" as const,
  })),
];

/**
 * Respuestas posibles para el autocompletado. Por defecto son las respuestas
 * correctas del catálogo (sin duplicados). Añade distractores extra si quieres.
 */
export const POSSIBLE_ANSWERS: string[] = Array.from(
  new Set(CLIPS.map((c) => c.answer)),
).sort((a, b) => a.localeCompare(b, "es"));
