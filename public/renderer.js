
document.addEventListener('DOMContentLoaded', () => {
    window.api.onShowMessage((event, message) => {
        console.log(message);
    });
    const dropArea = document.getElementById('drop-area');
    const fileList = document.getElementById('file-list');

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('highlight');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
    });

    let existingFiles = [];
    dropArea.addEventListener('drop', async (event) => {
        event.preventDefault();
        dropArea.classList.remove('highlight');

        const files = event.dataTransfer.files;
        for (const file of files) {
            console.log('info:', file); // Aquí se imprime el path o la URL del archivo
            console.log('file.existingFiles', existingFiles);
            let fileExists = existingFiles.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );

            if (fileExists) {
                console.log(`El archivo "${file.name}" ya existe y tiene el mismo tamaño.`);
                alert(`El archivo "${file.name}" ya existe y tiene el mismo tamaño.`);
                continue;
            }

            if (file.path) {
                // Si el archivo tiene un path, no es necesario leerlo como Data URL
                const fileParams = { fileName: file.name, filePath: file.path };
                const confirmation = confirm(`¿Desea agregar el archivo "${file.name}"?`);
                if (confirmation) {
                    const result = await window.api.addFilePath(fileParams);
                    if (result.success) {
                        loadFileList();
                    } else {
                        alert(`Error al agregar el archivo: ${result.error}`);
                    }
                }
            } else {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const fileParams = { fileToAdd: e.target.result, fileName: file.name };
                    const confirmation = confirm(`¿Desea agregar el archivo "${file.name}"?`);
                    if (confirmation) {
                        const result = await window.api.addFilePath(fileParams);
                        if (result.success) {
                            loadFileList();
                        } else {
                            alert(`Error al agregar el archivo: ${result.error}`);
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    });

    const loadFileList = async () => {
        const files = await window.api.getFilesInFolder();
        existingFiles = files; // Asegurarse de que existingFiles sea un array plano
        console.log('loadFileList', files);
        fileList.innerHTML = files.map(file => `
            <div class="file-item">
                <span>${file.name}</span>
                <button onclick="deleteFile('${file.name}')">Delete</button>
                <button class="play-button">Play</button>
                ${getMediaElement(file.path, file.type)}
            </div>
        `).join('');
    };

    const getMediaElement = (filePath, fileType) => {
        if (fileType) {
            if (fileType.startsWith('image/')) {
                return `<img src="${filePath}" class="file-thumbnail" />`;
            } else if (fileType.startsWith('video/')) {
                return `<video controls class="file-thumbnail">
                            <source src="${filePath}" type="${fileType}">
                            Your browser does not support the video tag.
                        </video>`;
            } else if (fileType.startsWith('audio/')) {
                return `<audio controls class="file-thumbnail">
                            <source src="${filePath}" type="${fileType}">
                            Your browser does not support the audio tag.
                        </audio>`;
            } else {
                return `<span>Unsupported file type</span>`;
            }
        } else {
            return `<img src="${filePath}" class="file-thumbnail" />`;
        }
    };

    window.deleteFile = async (fileName) => {
        await window.api.deleteFile(fileName);
        loadFileList();
    };

    let overlayPage = null; // Variable para almacenar la referencia a la ventana emergente

    fileList.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON' && target.classList.contains('play-button')) {
            const fileItem = target.closest('.file-item');
            const fileIndex = Array.from(fileItem.parentNode.children).indexOf(fileItem);
            const file = existingFiles[fileIndex];
            console.log('file', file);
            // Additional data to be sent with the event
            const additionalData = { example: 'additional data' };
            try {
                await window.api.createOverlayWindow();
                await window.api.sendOverlayData('play', { src: file.path, fileType: file.type, additionalData });
                console.log('Overlay event sent');
            } catch (error) {
                console.error('Error sending overlay event:', error);
            }
        } else if (target.tagName === 'BUTTON' && target.textContent === 'Delete') {
            const fileItem = target.closest('.file-item');
            const fileName = fileItem.querySelector('span').textContent;
            deleteFile(fileName);
        }
    });
    
    
    
    function addOverlayEvent(eventType, data) {
        if (!overlayPage || overlayPage.closed) {
            overlayPage = window.open('overlay.html', 'transparent', 'width=auto,height=auto,frame=false,transparent=true,alwaysOnTop=true,nodeIntegration=no');

        }
        setTimeout(() => {
            try {
                overlayPage.postMessage({ eventType, indexData: data }, '*');
            } catch (err) {
                console.error('Error sending message to overlayPage:', err);
            }
        }, 500);
    }

    loadFileList();
    document.getElementById('connect-button').addEventListener('click', async () => {
        const result = await window.api.createClientOsc();

        if (result.success) {
            console.log('OSC Client created successfully');
        } else {
            console.error('Failed to create OSC Client');
        }
    });
    document.getElementById('createBotForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        // ipExample = "localhost:25565";
        const keyBOT = document.getElementById('keyBOT').value.trim();
        const keySERVER = document.getElementById('keySERVER').value.trim();
        serverip = keySERVER.split(':')[0];
        serverport = keySERVER.split(':')[1] || 25565;
        const keyLOGIN = document.getElementById('keyLOGIN').value.trim();
        const resultMessage = document.getElementById('resultMessage');

        const options = {
            host: serverip,
            port: serverport,
            username: keyBOT,
        };
        console.log('options', options);
        const result = await window.api.createBot(options);
        if (result.success) {
            console.log('Bot created successfully');

            window.api.onBotEvent((event, type, data) => {
                if (type === 'login') {
                    console.log('Bot logged in');
                    window.api.sendChatMessage(`${keyBOT} ${keyLOGIN}`);
                } else if (type === 'chat') {
                    console.log(`${data.username}: ${data.message}`);
                    if (data.message === 'hello') {
                        window.api.sendChatMessage('Hello there!');
                    }
                }
                console.log(result);
                resultMessage.textContent = result.message;
                console.log('%cEl bot está conectado', 'color: green');
                resultMessage.style.color = 'green';

            });
        } else {
            console.error('Failed to create bot');
            console.log('%cEl bot está desconectado', 'color: red');
            resultMessage.style.color = 'red';
        }
    });

});


