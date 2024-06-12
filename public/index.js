import tab5Action from "./tab5-action/tab5-action.js";
import tab5Event from "./tab5-event/tab5-event.js";

document.addEventListener('DOMContentLoaded', () => {
    let db;
    let editingEventId = null;
    
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
        loadEvents();
    };

    request.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };

    const actionselect = document.getElementById('actionselect');

  const overlayEventAdd = document.getElementById('OverlayEventAdd');
  const overlayEventName = document.getElementById('OverlayEventName');
  const overlayEventTrigger = document.getElementById('OverlayEventTrigger');
  const overlayEventActions = document.getElementById('OverlayEventActions');
  const overlayEventcontent = document.getElementById('OverlayEventcontent');

  // Load events from localStorage and display them in the select
  const overlayevents = localStorage.getItem('existingFiles') || '[]';
  const parsedOverlayEvents = JSON.parse(overlayevents);
  console.log('parsedOverlayEvents', parsedOverlayEvents);
  function loadLocalStorageEvents() {
      parsedOverlayEvents.forEach(file => {
          const option = document.createElement('option');
          option.value = file.name;
          option.textContent = file.name;
          overlayEventActions.appendChild(option);
      });
  }

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
        };
        request.onerror = (event) => {
            console.error('Error saving data to IndexedDB', event.target.error);
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
function createElementWithButtons(dbConfig, data) {
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
    editButton.addEventListener('click', () => {
        if (!data.Action) {
            objectModal.open(data);
        } else {
            objectModal2.open(data);
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
        console.log('Probando datos:', data);
        eventmanager("test", data);
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

// Llamada a la función onSaveHandler en el evento onSave
let objectModal;
tab5Action({
    elementContainer: document.getElementById('tab5-action'), 
    files: 
        parsedOverlayEvents,
    
    onSave: (datos) => onSaveHandlerAction(datos),
    saveData: (datos) => {onSaveHandlerAction(datos),//{updateDataInIndexedDB(databases.MyDatabaseActionevent, datos),
    console.log('saveData', datos)},
    onCancel: () => {
        // Lógica para el evento onCancel
    },
}).then((modal) => {
    objectModal = modal;
    document.getElementById('openaction').addEventListener('click', objectModal.open);
    document.getElementById('closeaction').addEventListener('click', objectModal.close);
    // Cargar datos desde IndexedDB al iniciar
});
let objectModal2;
tab5Event({
    elementContainer: document.getElementById('tab5-event'), 
    files: actionEvents,
    onSave: (datos) => {
        onSaveHandlerEvent(datos);
    },
    saveData: (datos) => {onSaveHandlerEvent(datos),//{updateDataInIndexedDB(databases.MyDatabaseActionevent, datos),
    console.log('saveData', datos)},
    onCancel: () => {
        // Lógica para el evento onCancel
    },
}).then((modal2) => {
    objectModal2 = modal2;
    document.getElementById('openevent').addEventListener('click', objectModal2.open);
    document.getElementById('closeevent').addEventListener('click', objectModal2.close);
    // Cargar datos desde IndexedDB al iniciar
});
    loadDataFromIndexedDB(databases.MyDatabaseActionevent);
    loadDataFromIndexedDB(databases.eventsDB);

  function handleSelectChange(event) {
      const selectedFileName = event.target.value;
      const selectedFile = parsedOverlayEvents.find(file => file.name === selectedFileName);
      console.log('Selected file from localStorage:', selectedFile);
  }

  overlayEventActions.addEventListener('change', handleSelectChange);

  function loadEvents() {
      if (!db) {
          console.error('Database not initialized');
          return;
      }

      const transaction = db.transaction(['events'], 'readonly');
      const objectStore = transaction.objectStore('events');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
          const events = event.target.result;
          overlayEventActions.innerHTML = ''; // Clear previous options
          overlayEventcontent.innerHTML = ''; // Clear previous content

          // Load events from IndexedDB
          events.forEach(event => {
              const option = document.createElement('option');
              option.value = event.id;
              option.textContent = event.name;

              // Create event elements for display
              const eventElement = document.createElement('div');
              eventElement.classList.add('modal-body');
              eventElement.innerHTML = `
                  <p>Name: <span class="event-name">${event.name}</span></p>
                  <p>Trigger: <span class="event-trigger">${event.trigger}</span></p>
                  <p>Action: <span class="event-action">${event.action}</span></p>
                  <button class="edit-event" data-id="${event.id}">Edit</button>
                  <button class="delete-event" data-id="${event.id}">Delete</button>
              `;
              overlayEventcontent.appendChild(eventElement);
          });

          // Load events from localStorage
          loadLocalStorageEvents();
      };

      request.onerror = (event) => {
          console.error('Failed to load events:', event.target.errorCode);
      };
  }

  overlayEventAdd.addEventListener('click', () => {
      const name = overlayEventName.value;
      const trigger = overlayEventTrigger.value;
      const action = overlayEventActions.value;

      if (name && trigger) {
          const transaction = db.transaction(['events'], 'readwrite');
          const objectStore = transaction.objectStore('events');
          const request = objectStore.add({ name, trigger, action });

          request.onsuccess = (event) => {
              console.log('Event added to the database:', event.target.result);
              loadEvents(); // Refresh the list of events
          };

          request.onerror = (event) => {
              console.error('Failed to add event:', event.target.errorCode);
          };
      } else {
          alert('Please fill in all fields.');
      }
  });

  overlayEventcontent.addEventListener('click', (event) => {
      if (event.target.classList.contains('edit-event')) {
          editingEventId = parseInt(event.target.dataset.id);
          const eventElement = event.target.closest('.modal-body');
          const name = eventElement.querySelector('.event-name').textContent;
          const trigger = eventElement.querySelector('.event-trigger').textContent;
          const action = eventElement.querySelector('.event-action').textContent;

          eventElement.innerHTML = `
              <p>Name: <input type="text" class="edit-name" value="${name}" /></p>
              <p>Trigger: <input type="text" class="edit-trigger" value="${trigger}" /></p>
              <p>Action: <input type="text" class="edit-action" value="${action}" /></p>
              <button class="save-edit" data-id="${editingEventId}">Save</button>
              <button class="cancel-edit">Cancel</button>
          `;
      }

      if (event.target.classList.contains('delete-event')) {
          const eventId = parseInt(event.target.dataset.id);
          const transaction = db.transaction(['events'], 'readwrite');
          const objectStore = transaction.objectStore('events');
          const request = objectStore.delete(eventId);

          request.onsuccess = (event) => {
              console.log('Event deleted:', eventId);
              loadEvents(); // Refresh the list of events
          };

          request.onerror = (event) => {
              console.error('Failed to delete event:', event.target.errorCode);
          };
      }

      if (event.target.classList.contains('save-edit')) {
          const eventId = parseInt(event.target.dataset.id);
          const eventElement = event.target.closest('.modal-body');
          const name = eventElement.querySelector('.edit-name').value;
          const trigger = eventElement.querySelector('.edit-trigger').value;
          const action = eventElement.querySelector('.edit-action').value;

          if (name && trigger && action) {
              const transaction = db.transaction(['events'], 'readwrite');
              const objectStore = transaction.objectStore('events');
              const request = objectStore.put({ id: eventId, name, trigger, action });

              request.onsuccess = (event) => {
                  console.log('Event updated:', eventId);
                  loadEvents(); // Refresh the list of events
              };

              request.onerror = (event) => {
                  console.error('Failed to update event:', event.target.errorCode);
              };
          } else {
              alert('Please fill in all fields.');
          }
      }

      if (event.target.classList.contains('cancel-edit')) {
          loadEvents(); // Reload events to revert changes
      }
  });

  if (db) {
      loadEvents();
  }
});
