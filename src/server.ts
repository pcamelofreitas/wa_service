import express from 'express';
import WhatsAppService from "./services/whatsapp.service";
import { TemplateRenderer } from './templateRenderer';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const whatsappService = new WhatsAppService();
whatsappService.start().catch(console.error);


app.post('/send-message', async (req, res) => {
  const { message, numbers } = req.body;
  if (!message || !numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    await whatsappService.sendMessage(message, numbers);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/qrcode', (req, res) => {
  const qrCode = whatsappService.getQRCode();
  const connectionStatus = whatsappService.getConnectionStatus();
  
  try {
    if (whatsappService.isConnected()) {
      const html = TemplateRenderer.render('connected', { connectionStatus });
      return res.status(200).send(html);
    }
    
    if (!qrCode) {
      const html = TemplateRenderer.render('waiting', { connectionStatus });
      return res.status(404).send(html);
    }
    
    const html = TemplateRenderer.render('qrcode', { qrCode, connectionStatus });
    res.status(200).send(html);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/status', (req, res) => {
  const connectionStatus = whatsappService.getConnectionStatus();
  const isConnected = whatsappService.isConnected();
  
  res.status(200).json({
    connectionStatus,
    connected: isConnected,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 HTTP Server running on port ${port}`);
  console.log(`📱 WhatsApp Service started`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   📤 Send message: POST http://localhost:${port}/send-message`);
  console.log(`   📱 Get QR code: GET http://localhost:${port}/qrcode`);
  console.log(`   📊 Check status: GET http://localhost:${port}/status`);
});

export default app;