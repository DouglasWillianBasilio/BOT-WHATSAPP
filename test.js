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

// Número de WhatsApp para o qual o bot enviará a mensagem de notificação
const numeroNotificacao = 'NUMERO_DESTINO'; // Substitua pelo número real

// Variáveis de estado para rastrear a etapa atual e o estado da aplicação
const userState = {};
let isPaused = false;

client.on('message', async (message) => {
    if (message.body && !message.isGroupMsg) {
        const phone = message.from;
        if (!userState[phone]) {
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
                    // Enviar uma mensagem de notificação para o número configurado para a notificação
                    const notificacao = `Um usuário com o número ${phone} solicitou um orçamento.`;
                    await client.sendMessage(numeroNotificacao, notificacao);

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
                    // Fornecer um link de redirecionamento para o atendente
                    response = 'Clique neste link para falar com um atendente: https://wa.me/número_atendente';
                    userState[phone] = undefined; // Reiniciar o código
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
