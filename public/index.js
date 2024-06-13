import tab5Action from "./tab5-action/tab5-action.js";
import tab5Event from "./tab5-event/tab5-event.js";
import overlaymedia from "./overlay/overlaymedia.js";
import { databases, saveDataToIndexedDB, deleteDataFromIndexedDB, updateDataInIndexedDB, loadDataFromIndexedDB, getDataFromIndexedDB } from './indexedDB.js';

  function getoverlayEvents() {
    const overlayEvents = localStorage.getItem('existingFiles') || '[]';
    return JSON.parse(overlayEvents);
  }
  // Load events from localStorage and display them in the select
  const parsedOverlayEvents = getoverlayEvents();
  console.log('parsedOverlayEvents', parsedOverlayEvents);

  function getDataText(data) {
      return data && data.select ? data.select.name : 'N/A';
  }
  
  async function createElementWithButtons(dbConfig, data) {
      const container = document.createElement('div');
      container.className = 'data-container';
      container.dataset.id = data.id;
      const textElement = document.createElement('p');
      if (!data.Action) {
            // console.log('data', data.evento);
          textElement.textContent = `Evento: ${data.evento.nombre}, Audio: ${getDataText(data.audio)}, Video: ${getDataText(data.video)}, Imagen: ${getDataText(data.imagen)}`;
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
let objectModal2=null;


        
objectModal = await tab5Action({
    elementContainer: document.getElementById('tab5-action'),
    files: parsedOverlayEvents,
    onSave: (datos) => onSaveHandlerAction(datos),
    saveData: (datos) => {
        onSaveHandlerAction(datos);
        console.log('saveData', datos);
    },
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
    onSave: (datos) => {
        onSaveHandlerEvent(datos);
    },
    saveData: (datos) => {
        onSaveHandlerEvent(datos);
        console.log('saveData', datos);
    },
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
    closeEventBtn.addEventListener('click', () => objectModal2.close());
}

loadDataFromIndexedDB(databases.eventsDB, createElementWithButtons);
loadDataFromIndexedDB(databases.MyDatabaseActionevent, createElementWithButtons);

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