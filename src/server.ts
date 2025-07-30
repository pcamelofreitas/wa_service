import express from 'express';
import WhatsAppService from "./services/whatsapp.service";

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
app.listen(port, () => {
  console.log(`🚀 HTTP Server running on port ${port}`);
  console.log(`📱 WhatsApp Service started`);
  console.log(`📤 Send message: POST http://localhost:${port}/send-message`);
});

export default app;