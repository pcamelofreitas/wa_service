import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import * as QRCode from "qrcode";
import { rmSync, existsSync } from "fs";
import { join } from "path";

class WhatsAppService {
  private sock: any;
  private qrCodeData: string | null = null;
  private connectionStatus: string = "disconnected";

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
    this.connectionStatus = connection;

    if (qr) {
      const qrcode = require("qrcode-terminal");
      qrcode.generate(qr, { small: true });
      
      try {
        this.qrCodeData = await QRCode.toDataURL(qr);
        console.log("📱 QR Code gerado! Acesse GET /qrcode para visualizar");
      } catch (error) {
        console.error("Erro ao gerar QR code:", error);
      }
    } else {
      this.qrCodeData = null;
    }
  
    if (connection === "open") {
      console.log("✅ Servico conectado!");
      this.qrCodeData = null; 
    }

    if (connection === "close") {
      console.log("🔄 Conexão encerrada, tentando reconectar...");
      this.start();
    }
  };

  public getQRCode(): string | null {
    return this.qrCodeData;
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public isConnected(): boolean {
    return this.connectionStatus === "open";
  }

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

  public clearCredentials = async (): Promise<boolean> => {
    try {
      // Desconectar o socket atual
      if (this.sock) {
        await this.sock.logout();
        this.sock = null;
      }

      // Limpar dados em memória
      this.qrCodeData = null;
      this.connectionStatus = "disconnected";

      // Remover pasta de credenciais
      const authPath = join(process.cwd(), "auth_info");
      if (existsSync(authPath)) {
        rmSync(authPath, { recursive: true, force: true });
        console.log("🗑️ Credenciais removidas com sucesso");
      }

      console.log("✅ Credenciais limpas. Pronto para nova conexão.");
      return true;
    } catch (error) {
      console.error("❌ Erro ao limpar credenciais:", error);
      return false;
    }
  };

  public restart = async (): Promise<void> => {
    console.log("🔄 Reiniciando serviço WhatsApp...");
    await this.start();
  };
}

export default WhatsAppService;
