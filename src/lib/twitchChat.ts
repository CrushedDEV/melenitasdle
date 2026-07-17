// Cliente de chat de Twitch (solo lectura) vía IRC sobre WebSocket.
//
// No necesita OAuth ni backend: Twitch permite una conexión ANÓNIMA de lectura
// (usuario justinfan) para recibir todos los mensajes de un canal. Con eso basta
// para que el chat vote. Funciona 100% en el navegador (también en Vercel).

export type ChatStatus = "idle" | "connecting" | "connected" | "disconnected";
export type ChatHandler = (user: string, message: string) => void;
export type StatusHandler = (status: ChatStatus) => void;

const IRC_URL = "wss://irc-ws.chat.twitch.tv:443";

export class TwitchChat {
  readonly channel: string;
  private ws: WebSocket | null = null;
  private onMsg: ChatHandler;
  private onStatus: StatusHandler;
  private closed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(channel: string, onMsg: ChatHandler, onStatus: StatusHandler) {
    this.channel = channel.toLowerCase().replace(/^#/, "").trim();
    this.onMsg = onMsg;
    this.onStatus = onStatus;
  }

  connect(): void {
    if (typeof window === "undefined") return;
    this.closed = false;
    this.onStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(IRC_URL);
    } catch {
      this.onStatus("disconnected");
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      const nick = "justinfan" + Math.floor(Math.random() * 100000);
      ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      ws.send("NICK " + nick);
      ws.send("JOIN #" + this.channel);
      this.onStatus("connected");
    };
    ws.onmessage = (e) => this.handle(String(e.data));
    ws.onclose = () => {
      this.onStatus("disconnected");
      if (!this.closed) this.scheduleReconnect();
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch {
        /* noop */
      }
    };
  }

  private handle(raw: string): void {
    for (const rawLine of raw.split("\r\n")) {
      if (!rawLine) continue;

      if (rawLine.startsWith("PING")) {
        this.ws?.send("PONG :tmi.twitch.tv");
        continue;
      }

      // Quita los tags (empiezan por '@ ... ') si vienen.
      let line = rawLine;
      if (line[0] === "@") {
        const sp = line.indexOf(" ");
        if (sp === -1) continue;
        line = line.slice(sp + 1);
      }
      // Ahora: ':user!user@user.tmi.twitch.tv PRIVMSG #canal :mensaje'
      if (line[0] !== ":") continue;
      const sp2 = line.indexOf(" ");
      if (sp2 === -1) continue;
      const prefix = line.slice(1, sp2);
      const rest = line.slice(sp2 + 1);
      if (!rest.startsWith("PRIVMSG")) continue;

      const user = prefix.split("!")[0];
      const msgColon = rest.indexOf(":");
      const message = msgColon !== -1 ? rest.slice(msgColon + 1) : "";
      if (user && message) this.onMsg(user, message);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.closed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.closed) this.connect();
    }, 3000);
  }

  disconnect(): void {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      this.ws?.close();
    } catch {
      /* noop */
    }
    this.ws = null;
  }
}
