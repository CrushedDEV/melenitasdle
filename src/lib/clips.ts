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

  // --- nuevos (oct 2026) ---
  {
    url: "https://www.youtube.com/shorts/ThoB_MOOkZw",
    answer: "Las TELARAÑAS de Marvel's Spider-Man NO se ENGANCHAN a las paredes",
  },
  {
    url: "https://www.youtube.com/shorts/7TkFOAd1TsQ",
    answer: "Este PAYASO solo se mueve CUANDO NO LO MIRAS",
  },
  {
    url: "https://www.youtube.com/shorts/WwL1PCCtQO8",
    answer: "publi. He CREADO un JUEGO completo con GPT-6 Astra usando AURA",
  },
  {
    url: "https://www.youtube.com/shorts/Zh0U-JTIKhY",
    answer: "Esto es MUCHO MÁS que una simple SILLA",
  },
  {
    url: "https://www.youtube.com/shorts/8w0H3z43d5c",
    answer: "Así uso ANIMACIONES PROCEDURALES en mi juego para animar personajes por CÓDIGO",
  },
  {
    url: "https://www.youtube.com/shorts/EJd3OHgiT2s",
    answer: "publi. ¿Cuál de estos 3 ALGORITMOS de PATHFINDING es mejor?",
  },
  {
    url: "https://www.youtube.com/shorts/MNKeXYlcnl8",
    answer: "¡Las BALAS en mi juego ATRAVIESAN las PAREDES!",
  },
  {
    url: "https://www.youtube.com/shorts/LBFTVETKy7w",
    answer: "No vuelvas a usar variables BOOL para controlar a tu personaje - Mejor usa MÁQUINAS de ESTADOS",
  },
  {
    url: "https://www.youtube.com/shorts/3TMZVDXdkDE",
    answer: "He creado el SISTEMA de AUDIO que Unity debería tener",
  },
  {
    url: "https://www.youtube.com/shorts/v8MYp2e_2IY",
    answer: "publi. Día 9 creando un VIDEOJUEGO con las IDEAS de mis SEGUIDORES",
  },
  {
    url: "https://www.youtube.com/shorts/wM1hxuPekWA",
    answer: "publi. Puedo crear un juego completo en Unity solo usando IA",
  },
  {
    url: "https://www.youtube.com/shorts/0SqEMlSo7M8",
    answer: "Ni se te ocurra DUPLICAR código cuando programes tu juego",
  },
  {
    url: "https://www.youtube.com/shorts/Q-owfNhmYso",
    answer: "He enfrentado a 10.632 SEGUIDORES en mis propios SQUID GAMES",
  },
  {
    url: "https://www.youtube.com/shorts/YGraTSUTvEg",
    answer: "He creado el JUEGO DEL CALAMAR pero solo para mis SEGUIDORES",
  },

    //Clips twitch mele

        {
    url: "https://www.twitch.tv/melenitasdev/clip/SwissPlumpTurnipLeeroyJenkins-g2fH6UbB0VdycM-6?filter=clips&range=7d",
    answer: "Que susto coño 2.0",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/GrotesqueElatedSkirretTF2John-9Cs4jKCBa5-wqu_g?filter=clips&range=all",
    answer: "Cancelación definitiva final final esta vez si.mp4",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/DeafBlushingCattleMikeHogu-BFDUNv2rhv_9Ah3l?filter=clips&range=all",
    answer: "A ver si trabajas",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/TiredVivaciousBeefShazBotstix-80E8Yt2iSxl8yKLt?filter=clips&range=all",
    answer: "Melenitas págame estafador",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/HilariousBenevolentOpossumThunBeast-wWnqjDEKftwPWZ23?filter=clips&range=all",
    answer: "mele???",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/BenevolentEagerFlyPermaSmug-7QFlH26pMsA_EQ0y?filter=clips&range=all",
    answer: "Que son unos cargo",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/TawdryDreamySandwichOneHand-waWTRM0LbNANKe5f?filter=clips&range=all",
    answer: "cayendo",
  },
          {
    url: "https://www.twitch.tv/melenitasdev/clip/HyperAliveMuleDoubleRainbow-NhfNEIxmEmUs9lrj?filter=clips&range=all",
    answer: "Eva cumshot",
  },
            {
    url: "https://www.twitch.tv/melenitasdev/clip/FurryColdRaisinFeelsBadMan-lz7g0SICZLs7Ptqy?filter=clips&range=all",
    answer: "Olaf = Melenitas",
  },
              {
    url: "https://www.twitch.tv/melenitasdev/clip/WealthyMoldyDiamondWow-nJcroIIy0yLXhXoP",
    answer: "me la agarras con la mano?",
  },
  // --- nuevos (oct 2026) ---
  {
    url: "https://www.twitch.tv/melenitasdev/clip/PluckyNiceWrenchWholeWheat-yzJQ69MTv4nUODiB",
    answer: "Se puede ver el segundo exacto en que melenitas se rompe",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ScrumptiousSmoggyPlumChefFrank-f6bVwf-gjhB24uPP",
    answer: "abuela",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/CulturedBumblingSandpiperDxCat-jA2WfUTimG84N-kK",
    answer: "¿Me está oyendo algún francés?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/SucculentCrepuscularNuggetsNotATK-bbaCgakvjvg4TUJ7",
    answer: "Cómo? Qué grande quién?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BloodyInterestingSpaghettiDAESuppy-1Csx1Iq5R9aqhvJd",
    answer: "pino",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/EagerPuzzledBatRitzMitz-IbvXA8_81oW-VMfY",
    answer: "este hombre se qué???",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BlueGoodShieldWoofer-0dQ4oBJ_q26DvLcr",
    answer: "que comes qué?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/DifficultDeadPuddingHassanChop-_hd6pOcFogOCymHN",
    answer: "96 promesa",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/SmallLittlePancakeShazBotstix-NQ73u_zeEyUUK71r",
    answer: "el pibe volador en piruetas",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/GrossSmoothKumquat4Head-a-OtE-t320pOXBef",
    answer: "Mele tiene razón?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/MildTolerantElephantWOOP-oN70u54FTe2vHFQ7",
    answer: "mele deja la programacion",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/EmpathicNurturingPresidentKlappa-h2Qu-vgS5DVAMaX2",
    answer: "Bong sostenido",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/GlutenFreeRenownedPandaTooSpicy-ssa5aSIVp1eNUmI9",
    answer: "Recreando ASMR en un minuto",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BrainyCulturedGarageStoneLightning-kZID44Q7-oawzWZI",
    answer: "Ay qué susto!",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/HeartlessDeafLadiesPicoMause-B1dJolzjngnalGEz",
    answer: "di tu frase",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/PiercingProtectiveFennelDerp-5Z92QavOb916eM9b",
    answer: "ITALIA",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ImportantSnappyMochaDoritosChip-e4KX0zPAV5ZsDK1W",
    answer: "A mí no me hables en friki",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/VainFineAlligatorRalpherZ-fcrgjRMws46GjWUB",
    answer: "qué susto coño",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/TallColorfulMooseBigBrother--8UKHGZ1dfWcmcHn",
    answer: "Lilo on stream",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/GenerousYawningOryxHassanChop-d-JKfFMGtssuYVPQ",
    answer: "Melenitas hace de todo con los dedos",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/WittyDepressedLegArsonNoSexy-26E4sI_3xpQVHggM",
    answer: "por que no se acaba ya la guerra?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/DistinctTastySpiderRlyTho-x-SvTWkR6HIAKoQP",
    answer: "mele chisme?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ZealousPluckyMetalRiPepperonis-3fX4XDyf0FNT3v1g",
    answer: "EL PSOE",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/AdorableLazyAsparagusCharlietheUnicorn-gHFoLeYzIZ3pW7Q-",
    answer: "aparte tdh tiene ezquizofrenia",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BusyColdBulgogiPogChamp-EZcD8mJuE6-inBI-",
    answer: "QUE ENTRE VICENTEEEEE!!!!!!",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/CoweringCrunchyBoarDuDudu-3OongA8c2598kZy5",
    answer: "komanche",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/EntertainingFineWaffleRuleFive-VHToYB84ZoHq53oc",
    answer: "Paella de Pato (Nivek)",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ManlySpikyFinchShadyLulu-5lcUkYinNmvMy9Jc",
    answer: "sustooooo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/AlertMuddyCucumberFreakinStinkin-l9ODfWgKjGY7M2_M",
    answer: "haaaaaa perdon",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ToughFaintOcelotPartyTime-d72BBn69gfbJpi9X",
    answer: "bolas en las manos",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ChillyResilientJalapenoOhMyDog-CHCyfZEqhUwDcLj6",
    answer: "Que susto",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/DarkHilariousTildeANELE-qz6r4O8Fbw-78h8x",
    answer: "recreando mecanicas",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/SavoryBraveAnteaterPraiseIt-mkmmbs7U7cMSn5bL",
    answer: "regalo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/GentleHonorableStrawberryRitzMitz-hmOew48z8fUQmfqI",
    answer: "es una marca de ropa",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/AmusedRespectfulTriangleDoggo-EWzqkfJlrtwfBf1C",
    answer: "la que le ha caido",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/WittyDarkVultureSaltBae-ITl5j47EDULwOgso",
    answer: "pato asesino de hermanos",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/YawningHungryEyeballYee-JQHXKeUqUY3aPq4F",
    answer: "eva descuido parte 2",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/FantasticNaiveChowderSaltBae-j7g9w8tXwsajcsTi",
    answer: "no sigue a rothiotome (ah mira)",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/TenderEndearingArtichokeBloodTrail-_u4C0TXzwHBrTtIH",
    answer: "Risas que delatan",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/RockyVibrantCrabCharlietheUnicorn-gmUxbdxJOOsVM2H6",
    answer: "levanta las manos",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/KnottyRelentlessFerretJKanStyle-q-Nrq1_UJr7OyhvL",
    answer: "mele 🏳‍🌈",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/AgitatedCooperativeOcelotPicoMause-dzV1eDfRV-p4Sei1",
    answer: "Éxito rotundo!",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/RelentlessPeacefulBaconCoolStoryBob-I7omRJrnBwx1B_Nw",
    answer: "agarramela que me crece",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/PluckyYummyEagleTTours-WV8FlQn9FL7JvhlZ",
    answer: "mi mami?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/DeadAgreeableRingSaltBae-rV-S_4rQtAqJD9t-",
    answer: "casi lo conseguimos",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ResourcefulDelightfulPeachUnSane-9Ji2e3MuXB0tLFBP",
    answer: "Litos ya me estas jodiendo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/DifferentBlitheGarlicShazBotstix-cWG00rDuDrMJXdSm",
    answer: "tirando beef a german",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/RefinedMoralPastaSMOrc-fl5B3ucLZWoh6NgL",
    answer: "melenitas bugs",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ResilientEvilKimchiPrimeMe-nBiPfBZoiJHZGg6a",
    answer: "Eva, búscate un trabajo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ExuberantUninterestedSwanNinjaGrumpy-SVPDNNw7yIDgtnVE",
    answer: "La mejor declaración de amor de la historia",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/FlaccidViscousLatteDendiFace-XkBNbpeOxYItDX-q",
    answer: "eva gruñido",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BitterYawningSangAliens-JAKX-Vz6RgDZ0x5J",
    answer: "pero mele?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/InnocentSteamyPineappleUWot-iOK80snjqodIu4eo",
    answer: "que pedazo paquete no?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ClearTemperedIguanaStinkyCheese-0Jc8hzD_Y6FiKOQd",
    answer: "lenguaje de señas",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/PoorDeliciousHummingbirdKappaClaus-cTHgD3kjy5NNhlZR",
    answer: "\"Chicos se me...\"",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/FlaccidLivelyWhaleArgieB8-giwvP2KGavOAV9dV",
    answer: "Que va a pillar?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/MotionlessIntelligentWoodcockImGlitch-CxL-27vNcRBRdoLd",
    answer: "enfado con el chat",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/FrigidRamshackleLadiesSuperVinlin-H5LANAlTMF5biRFq",
    answer: "Soy machista",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/StupidMoralKleeFutureMan-BYVrO3z28NqcH4_o",
    answer: "sustillo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/GrossPopularNuggetsOhMyDog-8s0PaI6j4Gua92dY",
    answer: "que bonito link",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ArbitraryCrypticGerbilHassanChop-nXsnzcoLQG5YgoWb",
    answer: "Melenitas amenazado por un g",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/AlluringClearDiscKappaWealth-Mvsm8Iw5z3zfVtZI",
    answer: "profesional en meter qué melenitas?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/CrypticElegantSoymilkSmoocherZ-plFboR16jS-GBQXj",
    answer: "Paro cardíaco",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/GracefulDifferentKoalaPupper-fBR1enH-znLVIQYc",
    answer: "Presumiendo de bachillerato",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ShakingEnthusiasticRavenVoteNay-SY-45EB7VAelF5h8",
    answer: "eva envidia",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/PlausibleRelentlessDragonStrawBeary-GXyKqrljK5DNgZVF",
    answer: "Fa-kings",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BelovedHeartlessFrogMikeHogu-TX46yXtHSzGdWW8p",
    answer: "duki se pasa a saludar",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BumblingPluckyNarwhalDatSheffy-EEIh0PHaetZoSbMn",
    answer: "Outer wilds pero multijugador",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/SteamyFlirtyOtterAMPEnergyCherry-5OMaQpKKIms1sxeP",
    answer: "Tema principal del juego...",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/VivaciousPlumpLocustM4xHeh-Qt-YDBLTJq4dFA8Z",
    answer: "Paro cardíaco x2",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/FamousAwkwardAlbatrossAllenHuhu-WfsJMC_fsWr-XA_R",
    answer: "kevedo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/SavoryCrackySeahorseCoolStoryBob-A_7e44kNrIJdeNUL",
    answer: "Coooomooooooo?!??!?!?!?!?!",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/MushyIgnorantSnoodFunRun-82EGuz2_C7JHWbJf",
    answer: "Me fui de cariñosas",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/BoredSilkyOryxGOWSkull-GRn9mrxMVKX_MdSX",
    answer: "96 calvo",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/LovelySuspiciousHorseSuperVinlin-yA0Z9z78_74dnf6a",
    answer: "Eva tiene más biceps que tú",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/InventiveObedientCheesecakeMVGame-aGSMdawzXS3Pv_XJ",
    answer: "Que me recomiendas para la primera noche?",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/SpikyRichMartenKappaPride-bNa-ekwzHrRx50M9",
    answer: "Me quiero comprar una moto",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/FuriousHilariousPig4Head-qirhL_nOI4zjpphm",
    answer: "seguidor facha",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/PowerfulCredulousButterCharlietheUnicorn-2T6pF6wvdRYf9VH_",
    answer: "Los sucesores de melenitas",
  },
  {
    url: "https://www.twitch.tv/melenitasdev/clip/ObservantFriendlyPigDAESuppy-OHWo_M9BuYo2QxvD",
    answer: "Mele unleashed",
  },


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

  // --- nuevos (oct 2026) ---
  {
    url: "https://www.youtube.com/watch?v=4e-IaSMZwvA",
    answer: "Rise - Un SUSCRIPTOR volvió ADICTIVO un juego de SIMULADOR",
  },
  {
    url: "https://www.youtube.com/watch?v=WY2q8X9b_jo",
    answer: "Rise - ¿Por qué TRABAJAR en VIDEOJUEGOS es DIVERTIDO?",
  },
  {
    url: "https://www.youtube.com/watch?v=v6n77xlrYX0",
    answer: "Rise - ¿Por qué el 99% de los indies fracasa miserablemente?",
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
  // --- nuevos (oct 2026) ---
  {
    url: "https://www.youtube.com/shorts/MLlhp5kr81E",
    answer: "Centus - ESTE AGUJERO ES FALSO",
  },
  {
    url: "https://www.youtube.com/shorts/XVrZlGTIlZ4",
    answer: "Centus - ESTE PERSONAJE NO TIENE ESQUELETO",
  },
  {
    url: "https://www.youtube.com/shorts/90dsM5FRe4I",
    answer: "Centus - DORMÍ SOLO 1 HORA Y MEDIA",
  },
  {
    url: "https://www.youtube.com/shorts/HHQDOQueFPw",
    answer: "Centus - ZOMBIES TSUNAMI EN 3D",
  },
  {
    url: "https://www.youtube.com/shorts/J3I2EQouZMA",
    answer: "Centus - ESTOS LADRILLOS SON UNA IMAGEN",
  },
  {
    url: "https://www.youtube.com/shorts/PdY-vOO7Ve4",
    answer: "Centus - HAN METIDO MINECRAFT EN ESTOS JUEGOS",
  },
  {
    url: "https://www.youtube.com/shorts/MNiASDD24uU",
    answer: "Centus - LAS LUCES EN VIDEOJUEGOS NO SON REALES",
  },
  {
    url: "https://www.youtube.com/shorts/W2h4yQuVToc",
    answer: "Centus - POR QUÉ ESTE GOLPE ES UNA BASURA",
  },
  {
    url: "https://www.youtube.com/shorts/zwruNgrabJg",
    answer: "Centus - PLANTS VS ZOMBIES EN 3D",
  },
  {
    url: "https://www.youtube.com/shorts/vhIYaLjqqa4",
    answer: "Centus - ¿LOS COCHES DEL GTA 6 VUELCAN?",
  },
  {
    url: "https://www.youtube.com/shorts/-XdnIwE7FO4",
    answer: "Centus - COMO FUNCIONAN LAS CÁMARAS EN VIDEOJUEGOS",
  },
  {
    url: "https://www.youtube.com/shorts/_7Wrmim4T28",
    answer: "Centus - ¿POR QUÉ TE DAN SI ESTÁS OCULTO?",
  },
  {
    url: "https://www.youtube.com/shorts/M4yzi5K2rMM",
    answer: "Centus - ¿SABES EN REALIDAD QUE ES UNA HITBOX?",
  },
  {
    url: "https://www.youtube.com/shorts/aXBwQrR-WAM",
    answer: "Centus - ¿COMO SE SABE CUANDO HAS HECHO UN COMBO?",
  },
  {
    url: "https://www.youtube.com/shorts/SneNTNXegdU",
    answer: "Centus - UNA PILA HA SALVADO TU PARTIDA DE POKEMON",
  },
  {
    url: "https://www.youtube.com/shorts/GBgDwVcaLh4",
    answer: "Centus - LOS COCHES EN VIDEOJUEGOS SON ESFERAS",
  },
  {
    url: "https://www.youtube.com/shorts/ydSJJxax8II",
    answer: "Centus - NO SABES CÓMO SE ROMPEN LOS OBJETOS EN VIDEOJUEGOS",
  },
  {
    url: "https://www.youtube.com/shorts/94Z3rKSpMsg",
    answer: "Centus - COMO SE HUNDE LA NIEVE EN VIDEOJUEGOS",
  },
  {
    url: "https://www.youtube.com/shorts/tqL19KOw_BQ",
    answer: "Centus - ES IMPOSIBLE TENER MILES DE ÁRBOLES SIN EXPLOTAR",
  },
  {
    url: "https://www.youtube.com/shorts/V6bE78BVLMo",
    answer: "Centus - COMO CONSEGUÍ IR A ALEMANIA POR HACER VIDEOJUEGOS 🇩🇪",
  },
  {
    url: "https://www.youtube.com/shorts/SCx3R_2nos0",
    answer: "Centus - LOS MINIMAPAS EN VIDEOJUEGOS NO SON COMO PENSÁIS",
  },
  {
    url: "https://www.youtube.com/shorts/lUEYK3jJtSA",
    answer: "Centus - COMO LOS ALDEANOS DEL MINECRAFT VUELVEN A SUS CASA",
  },
  {
    url: "https://www.youtube.com/shorts/cfkiLt257Jg",
    answer: "Centus - EL GUARDADO DE PARTIDA EN VIDEOJUEGOS",
  },
  {
    url: "https://www.youtube.com/shorts/5wGSYd80CJI",
    answer: "Centus - HE CREADO UN JUEGO DE LA FINAL DEL MUNDIAL 🇪🇸🇦🇷",
  },
  {
    url: "https://www.youtube.com/shorts/9iECpYxsLXk",
    answer: "Centus - COMO HACEN PARKOUR EN JUEGOS COMO ASSASSINS CREED",
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
