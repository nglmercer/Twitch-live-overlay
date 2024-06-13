import tab5Action from "./tab5-action/tab5-action.js";
import tab5Event from "./tab5-event/tab5-event.js";
import overlaymedia from "./overlay/overlaymedia.js";
import { databases, saveDataToIndexedDB, deleteDataFromIndexedDB, updateDataInIndexedDB, loadDataFromIndexedDB, getDataFromIndexedDB } from './indexedDB.js';
import { construirModal } from './tab5-event/tabevent.js';
import { log } from './utils/console.js';
    construirModal();
  function getoverlayEvents() {
    const overlayEvents = localStorage.getItem('existingFiles') || '[]';
    return JSON.parse(overlayEvents);
  }
  // Load events from localStorage and display them in the select
  const parsedOverlayEvents = getoverlayEvents();
  log.indexconsole('parsedOverlayEvents', parsedOverlayEvents);
  log.indexconsole('parsedOverlayEvents', parsedOverlayEvents);
  function getDataText(data) {
      return data && data.select ? data.select.name : 'N/A';
  }
  async function createElementWithButtons(dbConfig, data) {
    if (!data || !data.id) {
        console.error('Data is missing or invalid:', data);
        return;
    }

    // Eliminar contenedor existente si existe
    let existingContainer = document.querySelector(`.data-container[data-id="${data.id}"]`);
    if (existingContainer) {
        existingContainer.remove();
    }

    // Crear un nuevo contenedor
    const container = document.createElement('div');
    container.className = 'data-container';
    container.dataset.id = data.id;

    // Crear y agregar el elemento de texto
    const textElement = document.createElement('p');
    if (!data.Action) {
        textElement.textContent = `Evento: ${data.evento?.nombre || 'N/A'}, Audio: ${getDataText(data.audio)}, Video: ${getDataText(data.video)}, Imagen: ${getDataText(data.imagen)}`;
    } else {
        if (!data.Evento.select) {
            textElement.textContent = `Evento: ${data.Evento?.nombre || 'N/A'}, Acción: faltando`;
        } else {
            textElement.textContent = `Evento: ${data.Evento.nombre}, Acción: ${data.Action.select?.evento || 'N/A'}`;
        }
        log.indexconsole('createElementWithButtons', data);
    }
    container.appendChild(textElement);

    // Crear y agregar el botón de editar
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', async () => {
        if (!data.Action) {
            if (objectModal) {
                objectModal.onUpdate(data);
            } else {
                console.error('objectModal is null');
            }
        } else {
            if (objectModal2) {
                objectModal2.onUpdate(data);
            } else {
                console.error('objectModal2 is null');
            }
        }
    });
    container.appendChild(editButton);

    // Crear y agregar el botón de borrar
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Borrar';
    deleteButton.addEventListener('click', () => {
        container.remove();
        if (!data.Action) {
            deleteDataFromIndexedDB(databases.MyDatabaseActionevent, data.id);
        } else {
            deleteDataFromIndexedDB(databases.eventsDB, data.id);
        }
        log.indexconsole('deleteDataFromIndexedDB', data);
    });
    container.appendChild(deleteButton);

    // Crear y agregar el botón de probar
    const testButton = document.createElement('button');
    testButton.textContent = 'Probar';
    testButton.addEventListener('click', () => {
        eventmanager("test", data);
        eventmanager("Chat", "hola");
        log.indexconsole('testButton', data);
    });
    container.appendChild(testButton);

    // Agregar el contenedor al cuerpo del documento
    document.body.appendChild(container);
}

let objectModal=null;
let objectModal2=null;
        
objectModal = await tab5Action({
    elementContainer: document.getElementById('tab5-action'),
    files: parsedOverlayEvents,
    onSave: (datos) => log.indexconsole('onSave', datos),
    saveData: (datos) => log.indexconsole('saveData', datos),
    onCancel: () => {

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


const modal2 = await tab5Event({
    elementContainer: document.getElementById('tab5-event'),
    files: actionEvents,
    onSave: (datos) => log.indexconsole('onSave', datos),
    saveData: (datos) => log.indexconsole('saveData', datos),
    onCancel: () => {
    },
});
objectModal2 = modal2;
const openEventBtn = document.getElementById('openevent');
const closeEventBtn = document.getElementById('closeevent');
if (openEventBtn && closeEventBtn) {
    openEventBtn.addEventListener('click', () => {
        const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
        objectModal2.open(newFiles)
    });
    closeEventBtn.addEventListener('click', () => objectModal2.close(

    ));
}
window.señal = (valor) => {
    log.indexconsole("Señal recibida, ", valor);
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
  log.indexconsole('testInput', testInput);
  eventmanager(testInput.value, testInput.value);
});

// await window.api.sendOverlayData('play', { src: file.path, fileType: file.type, additionalData });
async function videoexists(video) {
    log.indexconsole('videoexists', video);
    if (video.check) {
        await window.api.createOverlayWindow();
        await window.api.sendOverlayData('play', { src: video.select.path, fileType: video.select.type, video });
    }
    return false;
}
async function audioexists(audio) {
    log.indexconsole('audioexists', audio);
    if (audio.check) {
        await window.api.createOverlayWindow();
        await window.api.sendOverlayData('play', { src: audio.select.path, fileType: audio.select.type, audio });
    }
    return false;
}
async function imageexists(imagen) {
    log.indexconsole('imageexists', imagen);
    if (imagen.check) {
        await window.api.createOverlayWindow();
        await window.api.sendOverlayData('play', { src: imagen.select.path, fileType: imagen.select.type, imagen });
    }
    return false;
}


export default async function eventmanager(event, tags) {

    try {
        let eventsfind = await getDataFromIndexedDB(databases.eventsDB);
        eventsfind.forEach(eventname => {
            // let loweventname = eventname.toLowerCase();
            for (const [key, value] of Object.entries(eventname)) {
            // log.indexconsole('key', key, 'value', value);
                if (key === event) {
                    // log.indexconsole('event', event, 'found');
                    if (value.check) {
                        // log.indexconsole('key', key, 'value', value);
                        if (value.check) {
                            videoexists(eventname.Action.select.video);
                            audioexists(eventname.Action.select.audio);
                            imageexists(eventname.Action.select.imagen);
                        }
                    
                                // log.indexconsole('event', "true or false in for key value",event.Action); // Safe access using optional chaining

                    }
                }

        }
        /// test de prueba ya que el anterior duplica el numero de veces que realiza el evento
        });


    } catch (error) {
        console.error('Error in eventmanager', error);
    }
}
function modalhtml(event, tags) {
    
}