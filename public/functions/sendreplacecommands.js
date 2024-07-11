async function sendReplacedCommand(replacedCommand) {
    window.api.sendChatMessage(replacedCommand);
        // Espera hasta que la conexión WebSocket esté abierta
        if (ws){
            ws.send(replacedCommand);
            return;
        }
        document.getElementById('lastcomandsended').innerHTML = replacedCommand;
        while (!ws || ws.readyState !== WebSocket.OPEN) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 100 ms antes de verificar nuevamente
        }
        ws.send(replacedCommand);
        console.log(replacedCommand);
    }
export { sendReplacedCommand };