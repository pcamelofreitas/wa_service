import express from 'express';
import WhatsAppService from "./services/whatsapp.service";
import { TemplateRenderer } from './templateRenderer';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const whatsappService = new WhatsAppService();
whatsappService.start().catch(console.error);


app.post('/send-message', async (req, res) => {
  const {nomeTemplate, wabaId, destinatarios, body } = req.body;
  if (!nomeTemplate || !wabaId || !destinatarios || !Array.isArray(destinatarios) || !body) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const message = `Olá, a ${body.parametros[0].valor} pode estar em situação de risco relacionada à violência doméstica. Este é um alerta de emergência.\n\nVocê pode acompanhar a localização dela em tempo real por este link: ${body.parametros[1].valor}.\n\nPedimos que tome as providências adequadas com urgência. Se necessário, entre em contato com serviços especializados ou autoridades locais.`;
    await whatsappService.sendMessage(message, destinatarios);
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

app.get('/admin', (req, res) => {
  try {
    const html = TemplateRenderer.render('admin');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error rendering admin template:', error);
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

// Endpoint para limpar credenciais (útil para homologação)
app.post('/clear-credentials', async (req, res) => {
  try {
    const success = await whatsappService.clearCredentials();
    
    if (success) {
      // Aguarda um pouco antes de reiniciar
      setTimeout(() => {
        whatsappService.restart().catch(console.error);
      }, 1000);
      
      res.status(200).json({ 
        success: true, 
        message: 'Credenciais limpas com sucesso. Serviço reiniciando...' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao limpar credenciais' 
      });
    }
  } catch (error) {
    console.error('Error clearing credentials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Endpoint para reiniciar o serviço
app.post('/restart', async (req, res) => {
  try {
    setTimeout(() => {
      whatsappService.restart().catch(console.error);
    }, 1000);
    
    res.status(200).json({ 
      success: true, 
      message: 'Serviço reiniciando...' 
    });
  } catch (error) {
    console.error('Error restarting service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao reiniciar serviço' 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 HTTP Server running on port ${port}`);
  console.log(`📱 WhatsApp Service started`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   📤 Send message: POST http://localhost:${port}/send-message`);
  console.log(`   📱 Get QR code: GET http://localhost:${port}/qrcode`);
  console.log(`   ⚙️  Admin panel: GET http://localhost:${port}/admin`);
  console.log(`   📊 Check status: GET http://localhost:${port}/status`);
  console.log(`   🗑️  Clear credentials: POST http://localhost:${port}/clear-credentials`);
  console.log(`   🔄 Restart service: POST http://localhost:${port}/restart`);
});

export default app;