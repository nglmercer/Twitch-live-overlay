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
      return data && data.select ? data.select.name : 'N/A';
  }//   const idelement = formulario.elements.namedItem('id');  

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


export default async function eventmanager(event, tags) {

    try {
        let eventsfind = await getDataFromIndexedDB(databases.eventsDB);
        eventsfind.forEach(eventname => {
            // let loweventname = eventname.toLowerCase();
            for (const [key, value] of Object.entries(eventname)) {
            // console.log('key', key, 'value', value);
                if (key === event) {
                    // console.log('event', event, 'found');
                    if (value.check) {
                        // console.log('key', key, 'value', value);
                        if (value.check) {
                            videoexists(eventname.Action.select.video);
                            audioexists(eventname.Action.select.audio);
                            imageexists(eventname.Action.select.imagen);
                        }
                    
                                // console.log('event', "true or false in for key value",event.Action); // Safe access using optional chaining

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