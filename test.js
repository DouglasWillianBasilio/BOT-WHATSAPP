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
const userMemory = {};
const chatTimeout = 30 * 60 * 1000; // Tempo limite de 30 minutos em milissegundos
let isPaused = false;
let lastInteractionTime = Date.now(); // Armazena o horário da última interação

client.on('message', async (message) => {
    if (message.body && !message.isGroupMsg) {
        const phone = message.from;

        if (!userMemory[phone]) {
            userMemory[phone] = {};
        }

        // Atualiza o horário da última interação com o usuário
        lastInteractionTime = Date.now();

        // Restaura o estado de pausa caso a opção "FALAR COM ATENDENTE" seja escolhida
        if (userState[phone] === 'waitingForOption' && message.body === '6') {
            isPaused = true;
            userState[phone] = undefined;
            await client.sendMessage(phone, 'Você escolheu falar com um atendente. O chatbot está pausado até que um atendente esteja disponível.');
            return;
        }

        // Verifica se o chat ficou mais de 30 minutos sem interações e retorna
        if (Date.now() - lastInteractionTime >= chatTimeout) {
            isPaused = false;
            await client.sendMessage(phone, 'Desculpe, parece que você ficou inativo por muito tempo. O chatbot está disponível novamente. Como posso ajudar?');
        }

        // Se o chat estiver pausado, retorna sem executar outras ações
        if (isPaused) {
            return;
        }

        if (!userState[phone]) {
            // Primeira mensagem do usuário, fornecer as opções
            userState[phone] = 'waitingForOption';
            await sendWelcomeMessage(message);
        } else {
            const escolhaOpcao = message.body;
            let response;

            // Restante do código do chatbot
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

                    // Armazena informações na "memória" do usuário
                    userMemory[phone].lastOption = escolhaOpcao;
                } else if (escolhaOpcao === '2') {
                    response = 'Passo a Passo para configurar seu IPTV: [.....]';

                    // Armazena informações na "memória" do usuário
                    userMemory[phone].lastOption = escolhaOpcao;
                } else if (escolhaOpcao === '3') {
                    response = 'Sua mensagem foi registrada, entraremos em contato em breve.';

                    // Armazena informações na "memória" do usuário
                    userMemory[phone].lastOption = escolhaOpcao;
                } else if (escolhaOpcao === 'voltar') {
                    // Exemplo de como utilizar informações armazenadas na "memória" do usuário
                    const lastOption = userMemory[phone].lastOption;

                    if (lastOption === '1') {
                        response = 'Você voltou à opção 1 do submenu IPTV.';
                    } else if (lastOption === '2') {
                        response = 'Você voltou à opção 2 do submenu IPTV.';
                    } else if (lastOption === '3') {
                        response = 'Você voltou à opção 3 do submenu IPTV.';
                    } else {
                        response = 'Você não selecionou uma opção anterior no submenu IPTV.';
                    }
                } else {
                    // Opção inválida
                    response = 'Opção inválida. Por favor, escolha uma das opções válidas do submenu IPTV. 😕';
                    await message.reply(response);

                    // Exemplo de como retornar à opção anterior
                    const lastOption = userMemory[phone].lastOption;
                    if (lastOption) {
                        return;
                    }
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

// Função para verificar o tempo limite e retornar se necessário
async function checkTimeoutAndReturn() {
    if (!isPaused && Date.now() - lastInteractionTime >= chatTimeout) {
        isPaused = false;
        await client.sendMessage(numeroNotificacao, 'Desculpe, parece que o usuário ficou inativo por muito tempo. O chatbot está disponível novamente. Como posso ajudar?');
    }

    // Agendando a próxima verificação após um intervalo de tempo
    setTimeout(checkTimeoutAndReturn, chatTimeout);
}

// Iniciar a verificação do tempo limite
checkTimeoutAndReturn();

