import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";

class WhatsAppService {
  private sock: any;

  public async start() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    this.sock = makeWASocket({ auth: state });

    this.sock.ev.on("creds.update", saveCreds);
    this.sock.ev.on("connection.update", this.handleConnectionUpdate);
    this.sock.ev.on("messages.upsert", this.handleIncomingMessage);
  }

  private handleConnectionUpdate = async ({
    connection,
    qr,
  }: {
    connection: string;
    qr?: string;
  }) => {


    if (qr) {
      const qrcode = require("qrcode-terminal");
      qrcode.generate(qr, { small: true });
    }
  
    if (connection === "open") {
      console.log("✅ Servico conectado!");

    }

    if (connection === "close") {
      console.log("🔄 Conexão encerrada, tentando reconectar...");
      this.start();
    }
  };

  public sendMessage = async (message: string, numbers: string[]) => {
    const contacts = numbers.map((number) => `${number}@s.whatsapp.net`);

    for (const jid of contacts) {
      await this.sock.sendMessage(jid, {
        text: message,
      });
    }
  };

  private handleIncomingMessage = async ({ messages }: any) => {
    const message = messages[0];
    if (!message.message || message.key.fromMe) return;

    const conversationId = message.key.remoteJid;

    console.log("=======================================");
    console.log(conversationId);
  };
}

export default WhatsAppService;
