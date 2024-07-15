import tab5Action from "./tab5-action/tab5-action.js";
import { createElementWithButtons } from './utils/createtable.js';
import { databases, saveDataToIndexedDB, deleteDataFromIndexedDB, updateDataInIndexedDB, loadDataFromIndexedDB, getDataFromIndexedDB, observer } from './functions/indexedDB.js';
import { replaceVariables } from "./functions/replaceVariables.js";
import { TTS, leerMensajes, skipAudio } from './functions/tts.js';    // construirModal();
let copyFiles = [];
  function getoverlayEvents() {
    const overlayEvents = localStorage.getItem('existingFiles') || '[]';
    return JSON.parse(overlayEvents);
  }
  // Load events from localStorage and display them in the select
  const parsedOverlayEvents = getoverlayEvents();
  console.log('parsedOverlayEvents', parsedOverlayEvents);
  console.log('parsedOverlayEvents', parsedOverlayEvents);

  async function getFiles() {
    try {
        const files = await window.api.getFilesInFolder();
        console.log('Files in folder:', files);

        // Reemplazar el contenido de copyFiles con los nuevos archivos obtenidos
        copyFiles = [...files];
        console.log('Updated copyFiles:', copyFiles);

        return files;
    } catch (error) {
        console.error('Error fetching files:', error);
        return [];
    }
}
const optionsgift = () => {
    const result = window.globalSimplifiedStates;
    console.log('optionsgift', result);
    return result;
}

let objectModal=null;
let objectModal2=null;
        
tab5Action({
    elementContainer: document.getElementById('tab5-action'),
    files: getFiles(), // Los archivos que se van a mostrar en la ventana emergente
    optionsgift: optionsgift(),
    onSave: (datos) => {console.log('onSave', datos)
        loadDataFromIndexedDB123();
        saveDataToIndexedDB(databases.eventsDB, datos)},
    onCancel: (datos) => {
        console.log('onCancel', datos);
        getFiles();
    },
}).then((modal) => {
    objectModal = modal;
    document.getElementById('openaction').addEventListener('click', objectModal.open);
    document.getElementById('closeaction').addEventListener('click', objectModal.close);
});

const openActionBtn = document.getElementById('openaction');
const closeActionBtn = document.getElementById('closeaction');
if (openActionBtn && closeActionBtn) {
    openActionBtn.addEventListener('click', () => {
        objectModal.open()
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
export { getfileId, objectModal };