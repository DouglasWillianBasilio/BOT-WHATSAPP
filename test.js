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

// Variáveis de estado para rastrear a etapa atual e o estado da aplicação
const userState = {};
let userName = ''; // Variável para armazenar o nome do usuário

client.on('message', async (message) => {
    if (message.body && !message.isGroupMsg) {
        const phone = message.from;
        if (!userState[phone]) {
            // Primeira mensagem do usuário, perguntar o nome
            userState[phone] = 'waitingForName';
            await askForName(message);
        } else if (userState[phone] === 'waitingForName') {
            // Resposta do usuário contendo o nome
            userName = message.body;
            userState[phone] = 'waitingForOption';
            await sendWelcomeMessage(message);
        } else {
            const escolhaOpcao = message.body;
            let response;
            if (userState[phone] === 'waitingForOption') {
                if (escolhaOpcao === '1') {
                    response = `Olá, ${userName}! Clique neste link para falar com um atendente: https://wa.me/55439999881351`;
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '2') {
                    userState[phone] = 'iptvSubMenu';
                    response = 'Qual é a sua dúvida sobre o IPTV?\n' +
                        '1️⃣ Instalação\n' +
                        '2️⃣ Configuração\n' +
                        '3️⃣ Falta de Sinal\n' +
                        '4️⃣ Falar com Atendente\n\n' +
                        'IPTV SUPER PROMOÇÃO: Indicando 2 amigos, você ganha 1 mês GRÁTIS!';
                } else if (escolhaOpcao === '3') {
                    response = 'Estamos localizados na Av Lucia Helena Gonçalves Viana, 916. 📍';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '4') {
                    response = 'Deixe seu nome completo e CPF que lhe enviaremos o comprovante de garantia. 📄';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '5') {
                    response = 'Quer vender? Deixe seus dados que entraremos em contato. 📞';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '6') {
                    response = `Olá, ${userName}! Clique neste link para falar com um atendente: https://wa.me/55439999881351`;
                    userState[phone] = undefined; // Reiniciar o código
                } else {
                    // Opção inválida
                    response = 'Opção inválida. Por favor, escolha uma das opções válidas. 😕';
                    await message.reply(response);
                    return await sendWelcomeMessage(message);
                } // RESPOSTAS SUBMENU IPTV
            } else if (userState[phone] === 'iptvSubMenu') {
                if (escolhaOpcao === '1') {
                    response = 'Para instalar seu IPTV, siga os seguintes passos [.....]';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '2') {
                    response = 'Para configurar seu IPTV, siga os seguintes passos [.....]';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '3') {
                    response = 'Seu contato foi salvo e estamos trabalhando para retomar o sinal. Assim que estabilizar, entraremos em contato.';
                    userState[phone] = undefined; // Reiniciar o código
                } else if (escolhaOpcao === '4') {
                    response = `Olá, ${userName}! Clique neste link para falar com um atendente: https://wa.me/55439999881351`;
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

async function askForName(message) {
    const askNameMessage = 'Olá! Qual é o seu nome? Por favor, informe seu nome para continuar.';
    await message.reply(askNameMessage);
}

async function sendWelcomeMessage(message) {
    const welcomeMessage = `Olá, ${userName}! Brothers eletrônica agradece seu contato, em que posso ajudar? 😉\n` +
        '1️⃣ QUERO COMPRAR\n' +
        '2️⃣ IPTV\n' +
        '3️⃣ ENDEREÇO\n' +
        '4️⃣ GARANTIA\n' +
        '5️⃣ QUERO VENDER\n' +
        '6️⃣ FALAR COM ATENDENTE';

    const optionsMessage = await message.reply(welcomeMessage);
    console.log('Mensagem enviada com opções:', optionsMessage.body);
}

client.on('message', message => {
    console.log('Mensagem recebida:', message.body);
    // Aqui você pode adicionar lógica para lidar com outras respostas recebidas, se necessário.
});

// Aqui você pode adicionar lógica para lidar com outras situações, se necessário.
// ...
