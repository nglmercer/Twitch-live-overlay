import tab5Action from "./tab5-action/tab5-action.js";
import tab5Event from "./tab5-event/tab5-event.js";
import overlaymedia from "./overlay/overlaymedia.js";
    let db;
    
    // Open IndexedDB
    const request = indexedDB.open('eventsDB', 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('trigger', 'trigger', { unique: false });
        objectStore.createIndex('action', 'action', { unique: false });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
    };

    request.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };


  // Load events from localStorage and display them in the select
  const overlayevents = localStorage.getItem('existingFiles') || '[]';
  const parsedOverlayEvents = JSON.parse(overlayevents);
  console.log('parsedOverlayEvents', parsedOverlayEvents);


  const databases = {
      eventsDB: { name: 'eventsDB', version: 1, store: 'events' },
      MyDatabaseActionevent: { name: 'MyDatabaseActionevent', version: 1, store: 'files' }
  };
  function openDatabase({ name, version, store }) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('name', 'name', { unique: false });
            objectStore.createIndex('type', 'type', { unique: false });
            objectStore.createIndex('path', 'path', { unique: false });
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function saveDataToIndexedDB(dbConfig, data) {
    openDatabase(dbConfig).then((db) => {
        const transaction = db.transaction([dbConfig.store], 'readwrite');
        const objectStore = transaction.objectStore(dbConfig.store);

        // Verificar y eliminar la propiedad id si no es válida
        if (typeof data.id !== 'number' || data.id <= 0) {
            delete data.id;
        }

        const request = objectStore.add(data);
        request.onsuccess = (event) => {
            console.log('Data saved to IndexedDB', data);
            data.id = event.target.result;
            console.log('data.id', data.id);
            createElementWithButtons(dbConfig, data);
            localStorage.setItem(dbConfig, JSON.stringify(data));
            console.log('localStorage', localStorage.getItem(dbConfig));
        };
        request.onerror = (event) => {
            console.error('Error saving data to IndexedDB', event.target.error);
            localStorage.setItem(dbConfig, []);
            console.log('localStorage', localStorage.getItem(dbConfig));
        };
    }).catch((error) => {
        console.error('Error opening IndexedDB', error);
    });
}

function getDataText(data) {
    return data && data.select ? data.select.name : 'N/A';
}

function deleteDataFromIndexedDB(dbConfig, id) {
    openDatabase(dbConfig).then((db) => {
        const transaction = db.transaction([dbConfig.store], 'readwrite');
        const objectStore = transaction.objectStore(dbConfig.store);
        const request = objectStore.delete(id);
        request.onsuccess = () => {
            console.log(`Data with id ${id} deleted from IndexedDB`);
        };
        request.onerror = (event) => {
            console.error('Error deleting data from IndexedDB', event.target.error);
        };
    }).catch((error) => {
        console.error('Error opening IndexedDB', error);
    });
}
function updateDataInIndexedDB(dbConfig, data, id) {
    openDatabase(dbConfig).then((db) => {
        const transaction = db.transaction([dbConfig.store], 'readwrite');
        const objectStore = transaction.objectStore(dbConfig.store);
        const request = objectStore.put(data);
        console.log('data id', data.id, id);
        request.onsuccess = () => {
            console.log(`Data with id ${data.id} updated in IndexedDB`);
        };
        request.onerror = (event) => {
            console.error('Error updating data in IndexedDB', event.target.error);
        };
    }).catch((error) => {
        console.error('Error opening IndexedDB', error);
    });
}
function loadDataFromIndexedDB(dbConfig) {
    openDatabase(dbConfig).then((db) => {
        const transaction = db.transaction([dbConfig.store], 'readonly');
        const objectStore = transaction.objectStore(dbConfig.store);
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
            const allRecords = event.target.result;
            allRecords.forEach(record => {
                createElementWithButtons(dbConfig, record);
            });
        };
        request.onerror = (event) => {
            console.error('Error loading data from IndexedDB', event.target.error);
        };
    }).catch((error) => {
        console.error('Error opening IndexedDB', error);
    });
}
async function getDataFromIndexedDB(dbConfig) {
    try {
        const db = await openDatabase(dbConfig);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([dbConfig.store], 'readonly');
            const objectStore = transaction.objectStore(dbConfig.store);
            const request = objectStore.getAll();
            
            request.onsuccess = (event) => {
                const allRecords = event.target.result;
                resolve(allRecords);
            };
            
            request.onerror = (event) => {
                console.error('Error loading data from IndexedDB', event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error opening database', error);
        throw error;
    }
}

async function createElementWithButtons(dbConfig, data) {
    const container = document.createElement('div');
    container.className = 'data-container';
    container.dataset.id = data.id;
    const textElement = document.createElement('p');
    if (!data.Action) {
        textElement.textContent = `Evento: ${data.evento}, Audio: ${getDataText(data.audio)}, Video: ${getDataText(data.video)}, Imagen: ${getDataText(data.imagen)}`;
    } else {
        if (!data.Evento.select) {
            textElement.textContent = `Evento: ${data.Evento.nombre}, Accion: faltando`;
        } else {
            textElement.textContent = `Evento: ${data.Evento.nombre}, Accion: ${data.Action.select.evento}`;
        }
        console.log('createElementWithButtons', data);
    }
    container.appendChild(textElement);

    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', async () => {
        if (!data.Action) {
            await initializeModalAction();
            if (objectModal) {
                objectModal.onUpdate(data);
            } else {
                console.error('objectModal is null');
            }
        } else {
            await initializeModalEvent();
            if (objectModal2) {
                objectModal2.onUpdate(data);
            } else {
                console.error('objectModal2 is null');
            }
        }
    });
    container.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Borrar';
    deleteButton.addEventListener('click', () => {
        container.remove();
        deleteDataFromIndexedDB(dbConfig, data.id);
        console.log('deleteDataFromIndexedDB', data);
    });
    container.appendChild(deleteButton);

    const testButton = document.createElement('button');
    testButton.textContent = 'Probar';
    testButton.addEventListener('click', () => {
        eventmanager("test", data);
        eventmanager("Chat", "hola");
    });
    container.appendChild(testButton);

    document.body.appendChild(container);
}

function onSaveHandlerAction(data) {
    const id = data.id ? data.id : undefined;
    console.log('onSaveHandlerAction', data);
    const dataToSave = {
        evento: data.evento.nombre,
        audio: data.audio,
        video: data.video,
        imagen: data.imagen
    };

    if (id) {
        dataToSave.id = id;
        updateDataInIndexedDB(databases.MyDatabaseActionevent, dataToSave);
        const container = document.querySelector(`.data-container[data-id="${id}"]`);
        if (container) {
            container.querySelector('p').textContent = `Evento: ${dataToSave.evento}, Audio: ${getDataText(dataToSave.audio)}, Video: ${getDataText(dataToSave.video)}, Imagen: ${getDataText(dataToSave.imagen)}`;
        }
    } else {
        saveDataToIndexedDB(databases.MyDatabaseActionevent, dataToSave);
    }
}

function onSaveHandlerEvent(data) {
    const id = data.id ? parseInt(data.id) : undefined;
    console.log('onSaveHandlerEvent', data);
    if (id) {
        data.id = id;
        updateDataInIndexedDB(databases.eventsDB, data);
        const container = document.querySelector(`.data-container[data-id="${id}"]`);
        if (container) {
            container.querySelector('p').textContent = `Evento: ${data.evento}, Event: ${getDataText(data.Action.select.evento)}`;
        }
    } else {
        saveDataToIndexedDB(databases.eventsDB, data);
    }
    console.log('onSave event', data, data.evento);
}
let objectModal=null;
let objectModal2;

async function initializeModalAction() {
    try {
        
        // modal.Files = ["", "", ""]
        // objectModal = {...modal}; asi se declara una copia de un objeto
        if (objectModal==null){
            objectModal = await tab5Action({
                elementContainer: document.getElementById('tab5-action'),
                files: parsedOverlayEvents,
                onSave: (datos) => onSaveHandlerAction(datos),
                saveData: (datos) => {
                    onSaveHandlerAction(datos);
                    console.log('saveData', datos);
                },
                onCancel: () => {
                    destroyModalAction();
                },
            });
        }
        const openActionBtn = document.getElementById('openaction');
        const closeActionBtn = document.getElementById('closeaction');
        if (openActionBtn && closeActionBtn) {
            // llamada 1
            openActionBtn.addEventListener('click', ()=>{
                const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
                objectModal.open(newFiles)
            });
            closeActionBtn.addEventListener('click', ()=>objectModal.close());
        }
        loadDataFromIndexedDB(databases.MyDatabaseActionevent);
    } catch (error) {
        console.error('Error initializing action modal:', error);
    }
}

function destroyModalAction() {
    if (objectModal) {
        objectModal.close();
    }
    const openActionBtn = document.getElementById('openaction');
    const closeActionBtn = document.getElementById('closeaction');
    if (openActionBtn && closeActionBtn) {
        // llamada 2
        openActionBtn.removeEventListener('click', ()=>{
            const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
            objectModal?.open(newFiles)
        });
        closeActionBtn.removeEventListener('click', ()=>{objectModal?.close()});
    }
}

async function initializeModalEvent() {
    try {
        const modal2 = await tab5Event({
            elementContainer: document.getElementById('tab5-event'),
            files: actionEvents,
            onSave: (datos) => {
                onSaveHandlerEvent(datos);
            },
            saveData: (datos) => {
                onSaveHandlerEvent(datos);
                console.log('saveData', datos);
            },
            onCancel: () => {
                destroyModalEvent();
            },
        });
        objectModal2 = modal2;
        const openEventBtn = document.getElementById('openevent');
        const closeEventBtn = document.getElementById('closeevent');
        if (openEventBtn && closeEventBtn) {
            const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
            // llamada 3
            openEventBtn.addEventListener('click', ()=>{
                const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
                objectModal2.open(newFiles)
            });
            closeEventBtn.addEventListener('click', ()=>objectModal2.close());
        }
        loadDataFromIndexedDB(databases.eventsDB);
    } catch (error) {
        console.error('Error initializing event modal:', error);
    }
}

function destroyModalEvent() {
    if (objectModal2) {
        objectModal2.close();
        objectModal2 = null;
    }
    const openEventBtn = document.getElementById('openevent');
    const closeEventBtn = document.getElementById('closeevent');
    if (openEventBtn && closeEventBtn) {
        const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
        // llamada 4
        openEventBtn.removeEventListener('click', ()=>{
            const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
            objectModal2?.open(newFiles)
        });
        closeEventBtn.removeEventListener('click', objectModal2?.close);
    }
}

// Inicializar los modales al cargar la página
initializeModalAction();
initializeModalEvent();

function dataoverlay() {

}
let overlayObject;
overlaymedia({
    modalevent: document.getElementById('tab5overlay'),
    Position: () => console.log('randomPosition'),
    overlay: () => console.log('randomSize'),
    dataoverlay: () => console.log('dataoverlay'),
    open: () => console.log('openreturn'),
    close: () => console.log('closereturn'),
    openreturn: () => console.log('openreturn'),
    closereturn: () => console.log('closereturn')
}).then((modal) => {
    overlayObject = modal;
    const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
    // llamada 5
    document.getElementById('openoverlay').addEventListener('click', ()=>{
        const newFiles = JSON.parse(localStorage.getItem('existingFiles') || '[]');
        overlayObject.open(newFiles)
    });
    document.getElementById('closeoverlay').addEventListener('click', overlayObject.close);
    // Cargar datos desde IndexedDB al iniciar
});
const testButton_actionevent = document.getElementById('testButton_actionevent');
testButton_actionevent.addEventListener('click', () => {
  const testInput = document.getElementById('testInput');
  console.log('testInput', testInput);
  eventmanager(testInput.value, testInput.value);
});
const EVENTS_MAP = {
    "bits": "Bits",
    "chat": "Chat",
    "follow": "Follow",
    "subscribe": "Subscribe",
    "subgift": "Subgift",
    "submysterygift": "Submysterygift",
    "sub": "Sub",
    "resub": "Resub",
    "gift": "Gift",
    "giftpaidupgrade": "Giftpaidupgrade",
    "default": "Default",
    "logon": "Logon",
    "test": "Test",
};

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

        eventsfind.forEach((event) => {
        const event_name = EVENTS_MAP[name]
        const isInEvent = event.hasOwnProperty(event_name)
        if(isInEvent && event[event_name].check){
            
        }
        })
    } catch (error) {
        console.error('Error in eventmanager', error);
    }
}