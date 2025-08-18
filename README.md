# 📱 WhatsApp Service API

Serviço para integração com WhatsApp usando Baileys, permitindo envio de mensagens e gerenciamento de conexões.

## 🚀 Features

- ✅ Conexão automática com WhatsApp Web
- ✅ Envio de mensagens para múltiplos contatos
- ✅ Interface web para visualizar QR Code
- ✅ Painel administrativo completo
- ✅ Endpoints para gerenciar credenciais
- ✅ Auto-reconexão em caso de falha

## 📋 Endpoints Disponíveis

### 🔗 Principais
- `GET /qrcode` - Exibe QR Code para conectar WhatsApp
- `GET /admin` - Painel administrativo completo
- `GET /status` - Status da conexão (JSON)
- `POST /send-message` - Enviar mensagem

### 🛠️ Administração
- `POST /clear-credentials` - Limpar credenciais salvas
- `POST /restart` - Reiniciar serviço

## 🏃‍♂️ Como Executar

### Desenvolvimento
```bash
npm install
npm run dev
```

### Produção
```bash
npm install
npm run build
npm start
```

## 🌐 Deploy

Este projeto está pronto para deploy em:

- **Railway** (Recomendado - Filesystem persistente)
- **Heroku** (Requer adaptação para database)
- **Render** (Filesystem ephemeral)
- **DigitalOcean App Platform**

### Variáveis de Ambiente

```bash
PORT=3000  # Porta do servidor (opcional)
```

## 📱 Como Usar

1. **Deploy na plataforma escolhida**
2. **Acesse `/admin`** para gerenciar o serviço
3. **Acesse `/qrcode`** e escaneie com WhatsApp
4. **Use `/send-message`** para enviar mensagens

## 🔧 Estrutura do Projeto

```
src/
├── services/
│   └── whatsapp.service.ts    # Serviço principal do WhatsApp
├── templates/
│   ├── qrcode.html           # Página do QR Code
│   ├── connected.html        # Página quando conectado
│   ├── waiting.html          # Página de aguardo
│   └── admin.html            # Painel administrativo
├── templateRenderer.ts       # Renderizador de templates
├── server.ts                 # Servidor Express
└── index.ts                  # Entry point

auth_info/                    # Credenciais WhatsApp (não versionado)
```

## 🚨 Importante

- A pasta `auth_info/` contém as credenciais do WhatsApp e não deve ser versionada
- Para homologação, use o endpoint `/clear-credentials` para trocar contas rapidamente
- O serviço reconnecta automaticamente em caso de falha
