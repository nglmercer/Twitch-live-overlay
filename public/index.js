import tab5Action from "./tab5-action/tab5-action.js";
import { databases, saveDataToIndexedDB, deleteDataFromIndexedDB, updateDataInIndexedDB, loadDataFromIndexedDB, getDataFromIndexedDB } from './indexedDB.js';
import { log } from './utils/console.js';
    // construirModal();
  function getoverlayEvents() {
    const overlayEvents = localStorage.getItem('existingFiles') || '[]';
    return JSON.parse(overlayEvents);
  }
  // Load events from localStorage and display them in the select
  const parsedOverlayEvents = getoverlayEvents();
  console.log('parsedOverlayEvents', parsedOverlayEvents);
  console.log('parsedOverlayEvents', parsedOverlayEvents);
  function getDataText(data) {
    return data && data.select ? data.select : 'N/A';
}

//   idelement.value = '12345';
async function createElementWithButtons(dbConfig, data) {
    if (!data || !data.id) {
        console.error('Data is missing or invalid:', data);
        return;
    }

    // Seleccionar o crear el contenedor
    let container = document.querySelector(`.data-container[data-id="${data.id}"]`);
    if (!container) {
        container = document.createElement('div');
        container.className = 'flex data-container';
        container.dataset.id = data.id;
        document.getElementById('loadrowactionsevents').appendChild(container);
    } else {
        // Limpiar el contenedor existente
        container.innerHTML = '';
    }

    // Crear el elemento de texto y agregarlo al contenedor
    const textElement = document.createElement('div');
    textElement.className = 'flex justify-center';
    console.log('data-------------createbutton', data);
    if (data.accionevento) {
        textElement.textContent = `Evento: ${data.accionevento?.nombre || 'N/A'}, Audio: ${getDataText(data["type-audio"])}, Video: ${getDataText(data["type-video"])}, Imagen: ${getDataText(data["type-imagen"])}`;
    } else {
            textElement.textContent = `Evento: ${data.accionevento?.nombre || 'N/A'}, Acción: faltando`;
    }
    container.appendChild(textElement);

    // Crear y agregar el botón de editar
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', async () => {
        objectModal.onUpdate(data);
    });
    container.appendChild(editButton);

    // Crear y agregar el botón de borrar
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Borrar';
    deleteButton.addEventListener('click', () => {
        container.remove();
        deleteDataFromIndexedDB(databases.MyDatabaseActionevent, data.id);
        setTimeout(() => {
        loadDataFromIndexedDB(databases.eventsDB, createElementWithButtons);
        loadDataFromIndexedDB(databases.MyDatabaseActionevent, createElementWithButtons);
        }, 1000);
        console.log('deleteDataFromIndexedDB', data);
    });
    container.appendChild(deleteButton);

    // Crear y agregar el botón de probar
    const testButton = document.createElement('button');
    testButton.textContent = 'Probar';
    testButton.addEventListener('click', () => {
        console.log('testButton', data);
    });
    container.appendChild(testButton);
}

let objectModal=null;
let objectModal2=null;
        
objectModal = await tab5Action({
    elementContainer: document.getElementById('tab5-action'),
    files: parsedOverlayEvents,
    onSave: (datos) => {console.log('onSave', datos)
    setTimeout(() => {
          loadDataFromIndexedDB123();

    }, 1000);
},
    saveData: (datos) => {console.log('onSave', datos)
    setTimeout(() => {
          loadDataFromIndexedDB123();
    }, 1000);
},
    onCancel: () => {
        console.log('onCancel');
    },
});

const openActionBtn = document.getElementById('openaction');
const closeActionBtn = document.getElementById('closeaction');
if (openActionBtn && closeActionBtn) {
openActionBtn.addEventListener('click', () => {
    const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
    objectModal.open(newFiles)
});
closeActionBtn.addEventListener('click', () => objectModal.close());
}



const openEventBtn = document.getElementById('openevent');
const closeEventBtn = document.getElementById('closeevent');

window.señal = (valor) => {
    console.log("Señal recibida, ", valor);
    loadDataFromIndexedDB123();
}
loadDataFromIndexedDB(databases.eventsDB, createElementWithButtons);
loadDataFromIndexedDB(databases.MyDatabaseActionevent, createElementWithButtons);
function loadDataFromIndexedDB123() {
    loadDataFromIndexedDB(databases.eventsDB, createElementWithButtons);
    loadDataFromIndexedDB(databases.MyDatabaseActionevent, createElementWithButtons);
}

const testButton_actionevent = document.getElementById('testButton_actionevent');
testButton_actionevent.addEventListener('click', () => {
  const testInput = document.getElementById('testInput');
  console.log('testInput', testInput);
  eventmanager(testInput.value, testInput.value);
});

// await window.api.sendOverlayData('play', { src: file.path, fileType: file.type, additionalData });
async function videoexists(video) {
    console.log('videoexists', video);
    if (video.check) {
        await window.api.createOverlayWindow();
        await window.api.sendOverlayData('play', { src: video.select.path, fileType: video.select.type, video });
    }
    return false;
}
async function audioexists(audio) {
    console.log('audioexists', audio);
    if (audio.check) {
        await window.api.createOverlayWindow();
        await window.api.sendOverlayData('play', { src: audio.select.path, fileType: audio.select.type, audio });
    }
    return false;
}
async function imageexists(imagen) {
    console.log('imageexists', imagen);
    if (imagen.check) {
        await window.api.createOverlayWindow();
        await window.api.sendOverlayData('play', { src: imagen.select.path, fileType: imagen.select.type, imagen });
    }
    return false;
}

const actionnameinput = document.getElementById('action-name');
const testactionevent = document.getElementById('testactionevent');
testactionevent.addEventListener('click', () => {
    eventmanager(actionnameinput.value, actionnameinput.value);
    // console.log('testactionevent', actionnameinput.value);
});
export default async function eventmanager(eventType, data) {
    console.log('eventmanager', eventType, "eventype data -------------------", data);

    let eventsfind = await getDataFromIndexedDB(databases.MyDatabaseActionevent);

    // Conjunto para almacenar los tipos de archivo que ya se han procesado
    let processedTypes = new Set();

    // Iteramos sobre cada evento encontrado
    eventsfind.forEach(eventname => {
        Object.entries(eventname).forEach(([key, value]) => {
            let splitkey = key.split('-');

            // Verificamos si el tipo de evento coincide y si el evento no tiene check
            if (splitkey[1] === eventType && !value.check) {
                console.log(splitkey, "eventsfind---------------------", eventsfind, "eventname---------------------", eventname, "eventType------------------", eventType, "value------------------", value, "key data -------------------", key);
                return true;
            }

            // Verificamos si el tipo de evento coincide
            if (splitkey[1] === eventType) {
                console.log('eventname', eventname["type-imagen"], "value", value, "key data -------------------", key);
                console.log('eventname', eventname["type-video"], "value", value, "key data -------------------", key);
                console.log('eventname', eventname["type-audio"], "value", value, "key data -------------------", key);

                // Procesamos el tipo de imagen si no ha sido procesado aún
                if (eventname["type-imagen"] && eventname["type-imagen"].check && !processedTypes.has("image")) {
                    processedTypes.add("image");
                    getfileId(eventname["type-imagen"].select).then(srcoverlay => {
                        if (srcoverlay !== null) {
                            window.api.createOverlayWindow();
                            window.api.sendOverlayData('play', { src: srcoverlay.path, fileType: srcoverlay.type, options: eventname["type-imagen"] });
                            console.log("srcoverlay encontrado", "index", eventname["type-imagen"].select, "src", srcoverlay.path, "fileType", srcoverlay.type);
                        }
                    });
                }

                // Procesamos el tipo de video si no ha sido procesado aún
                if (eventname["type-video"] && eventname["type-video"].check && !processedTypes.has("video")) {
                    processedTypes.add("video");
                    getfileId(eventname["type-video"].select).then(srcoverlay => {
                        if (srcoverlay !== null) {
                            window.api.createOverlayWindow();
                            window.api.sendOverlayData('play', { src: srcoverlay.path, fileType: srcoverlay.type, options: eventname["type-video"] });
                            console.log("srcoverlay encontrado", srcoverlay, "index", eventname["type-video"].select, "src", srcoverlay.path, "fileType", srcoverlay.type);
                        }
                    });
                }

                // Procesamos el tipo de audio si no ha sido procesado aún
                if (eventname["type-audio"] && eventname["type-audio"].check && !processedTypes.has("audio")) {
                    processedTypes.add("audio");
                    getfileId(eventname["type-audio"].select).then(srcoverlay => {
                        if (srcoverlay !== null) {
                            window.api.createOverlayWindow();
                            window.api.sendOverlayData('play', { src: srcoverlay.path, fileType: srcoverlay.type, options: eventname["type-audio"] });
                            console.log("srcoverlay encontrado", srcoverlay, "index", eventname["type-audio"].select, "src");
                        }
                    });
                }
            }
        });
    });
}
async function getfileId(id) {
    if (id === undefined || id === null) {
        return null;
    } 
    if (id === false) {
        return null;
    }
    let converidtonumber = Number(id);
    let findelement = window.api.getFileById(converidtonumber);
    // console.log('findelement', findelement,"else----------------", id, "id data -------------------", copyFiles);
    if (findelement) {
        return findelement;
    } else {
        return null;
    }
}