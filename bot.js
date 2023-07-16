const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp está conectado');
});

client.initialize();

// Variáveis de estado para rastrear a etapa atual, o atendimento do usuário e o estado da aplicação
const userState = {};
const userInAtendimento = {};
let isPaused = false;

client.on('message', async (message) => {
    if (message.body && !message.isGroupMsg) {
        const phone = message.from;
        if (userInAtendimento[phone]) {
            // Atendimento em andamento pelo atendente
            if (message.body.includes('Obrigado pelo contato, estamos à disposição')) {
                // O atendente encerrou a conversa
                userInAtendimento[phone] = false;
                isPaused = false; // Definir isPaused como false para retomar a aplicação
                userState[phone] = undefined;
                await sendWelcomeMessage(message);
                return;
            } else {
                // Atendimento em andamento, encaminhar mensagem para o atendente
                // ...
                return;
            }
        } else if (!userState[phone]) {
            // Primeira mensagem do usuário, fornecer as opções
            userState[phone] = 'waitingForOption';
            await sendWelcomeMessage(message);
        } else if (isPaused) {
            // Aplicação pausada aguardando atendente
            await client.sendMessage(phone, 'Aguarde um momento, estamos transferindo você para um atendente.');
        } else {
            const escolhaOpcao = message.body;
            let response;
            if (userState[phone] === 'waitingForOption') {
                if (escolhaOpcao === '1') {
                    response = 'Se você trouxe seu aparelho para um orçamento deixe seu nome e retornaremos em breve. 😉';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '2') {
                    userState[phone] = 'iptvSubMenu';
                    response = 'Escolha uma das opções do submenu IPTV:\n' +
                        '1️⃣ Instalação\n' +
                        '2️⃣ Configuração\n' +
                        '3️⃣ Falta de Sinal';
                } else if (escolhaOpcao === '3') {
                    response = 'Estamos localizados na Av Lucia Helena Gonçalves Viana, 916. 📍';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '4') {
                    response = 'Temos os seguintes aparelhos a pronta entrega: [...]. 👍';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '5') {
                    response = 'Deixe seu nome completo e CPF que lhe enviaremos o comprovante de garantia. 📄';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '6') {
                    response = 'Aguarde um momento, estamos transferindo você para um atendente.';
                    // Pausar a aplicação
                    isPaused = true;
                    // Encerrar a sessão
                    client.sendMessage(phone, response);
                    client.deleteChat(phone);
                } else {
                    // Opção inválida
                    response = 'Opção inválida. Por favor, escolha uma das opções válidas. 😕';
                    await message.reply(response);
                    return await sendWelcomeMessage(message);
                }
            } else if (userState[phone] === 'iptvSubMenu') {
                if (escolhaOpcao === '1') {
                    response = 'Passo a Passo para sua Instalação: [.....]';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '2') {
                    response = 'Passo a Passo para configurar seu IPTV: [.....]';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '3') {
                    response = 'Sua mensagem foi registrada, entraremos em contato em breve.';
                    userState[phone] = undefined; // Reiniciar o código
                } else {
                    // Opção inválida
                    response = 'Opção inválida. Por favor, escolha uma das opções válidas do submenu IPTV. 😕';
                    await message.reply(response);
                    return await sendWelcomeMessage(message);
                }
            }

            await message.reply(response);
        }
    }
});

async function sendWelcomeMessage(message) {
    const welcomeMessage = 'Brothers eletrônica agradece seu contato, em que posso ajudar? 😉\n' +
        '1️⃣ ORÇAMENTO\n' +
        '2️⃣ IPTV\n' +
        '3️⃣ ENDEREÇO\n' +
        '4️⃣ COMPRA\n' +
        '5️⃣ GARANTIA\n' +
        '6️⃣ FALAR COM ATENDENTE';

    const optionsMessage = await message.reply(welcomeMessage);
    console.log('Mensagem enviada com opções:', optionsMessage.body);
}
