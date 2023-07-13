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

// Variável de estado para rastrear a etapa atual
const userState = {};

client.on('message', async (message) => {
    if (message.body) {
        const phone = message.from;
        if (!userState[phone]) {
            // Primeira mensagem do usuário, fornecer as opções
            userState[phone] = 'waitingForOption';
            await sendOptionsMessage(message);
        } else {
            const selectedOption = message.body;
            let response;
            if (selectedOption === '1') {
                response = 'Se você trouxe seu aparelho para um orçamento deixe seu nome e retornaremos em breve. 😉';
                delete userState[phone]; // Reiniciar o código
            } else if (selectedOption === '2') {
                response = 'IPTV teste grátis por 6 horas e mensalidade de R$30, indicando dois amigos você ganha um mês grátis. 😃';
                delete userState[phone]; // Reiniciar o código
            } else if (selectedOption === '3') {
                response = 'Estamos localizados na Av Lucia Helena Gonçalves Viana, 916. 📍';
                delete userState[phone]; // Reiniciar o código
            } else if (selectedOption === '4') {
                response = 'Temos os seguintes aparelhos a pronta entrega: [...]. 👍';
                delete userState[phone]; // Reiniciar o código
            } else if (selectedOption === '5') {
                response = 'Deixe seu nome completo e CPF que lhe enviaremos o comprovante de garantia. 📄';
                delete userState[phone]; // Reiniciar o código
            } else {
                // Opção inválida
                response = 'Opção inválida. Por favor, escolha uma das opções válidas. 😕';
                await message.reply(response);
                return await sendOptionsMessage(message);
            }

            await message.reply(response);
        }
    }
});

async function sendOptionsMessage(message) {
    const optionsMessage = await message.reply(
        'Opção inválida. Por favor, escolha uma das opções válidas. 😕\n' +
        '1️⃣ ORÇAMENTO\n' +
        '2️⃣ IPTV\n' +
        '3️⃣ ENDEREÇO\n' +
        '4️⃣ COMPRA\n' +
        '5️⃣ GARANTIA'
    );
    console.log('Mensagem enviada com opções:', optionsMessage.body);
}
