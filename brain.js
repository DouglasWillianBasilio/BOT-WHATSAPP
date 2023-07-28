const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { NeuralNetwork } = require('brain.js'); // Adicionando o brain.js
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
let intentClassifier; // Variável para armazenar o modelo de classificação treinado

// Dados de treinamento para o modelo de classificação
const trainingData = [
    { input: 'quero um orçamento', output: { orçamento: 1 } },
    { input: 'preciso de um orçamento', output: { orçamento: 1 } },
    { input: 'iptv', output: { iptv: 1 } },
    { input: 'endereço', output: { endereço: 1 } },
    { input: 'onde fica', output: { endereço: 1 } },
    { input: 'compra', output: { compra: 1 } },
    { input: 'quero comprar', output: { compra: 1 } },
    { input: 'garantia', output: { garantia: 1 } },
    { input: 'perdi o comprovante de garantia', output: { garantia: 1 } }
    // Adicione mais exemplos de treinamento conforme necessário
];

// Função para treinar o modelo de classificação de intenções
function trainIntentClassifier() {
    const config = {
        hiddenLayers: [10, 5],
        activation: 'leaky-relu',
        iterations: 2000,
        learningRate: 0.01
    };
    const net = new NeuralNetwork(config);
    net.train(trainingData);

    intentClassifier = net.toFunction();
}

// Função para classificar a intenção da mensagem do usuário
function classifyIntent(message) {
    if (!intentClassifier) {
        trainIntentClassifier();
    }

    const result = intentClassifier(message);
    return Object.keys(result).reduce((a, b) => (result[a] > result[b] ? a : b));
}

client.on('message', async (message) => {
    if (message.body && !message.isGroupMsg) {
        const phone = message.from;

        if (!userMemory[phone]) {
            userMemory[phone] = {};
        }

        // Atualiza o horário da última interação com o usuário
        lastInteractionTime = Date.now();

        // Classifica a intenção da mensagem do usuário
        const userIntent = classifyIntent(message.body.toLowerCase());

        // Restante do código do chatbot
        // ...

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
            // ...
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
