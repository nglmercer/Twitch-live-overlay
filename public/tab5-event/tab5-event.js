export default async function tab5Action({ elementContainer, files = [], onSave = () => { },onUpdate = () => { }, saveData = () => { }, onCancel = () => { }, separator = "_" }) {
    const ModalElement = document.createElement('div');
    const idModal = `ModalElement${Math.floor(Math.random() * 1000)}`;
    console.log('files', files);
    const cacheAssign = {};
    ModalElement.className = 'modalElement';
    ModalElement.id = idModal;
    ModalElement.innerHTML = await (await fetch('./tab5-event/tab5-event.html')).text();
    elementContainer.parentNode.insertBefore(ModalElement, elementContainer.nextSibling);
    elementContainer.remove();
    const elementModal = document.getElementById(idModal);
    elementModal.style.display = 'none';
    elementModal.querySelector('.tab5-event').addEventListener('submit', event => {
        event.preventDefault();
    });
    const form = elementModal.querySelector('.tab5-event');
    console.log('elementModal', elementModal.querySelector('.tab5-event'));
    console.log('idmodal', idModal);
    let errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none';
    errorMessage.textContent = 'El nombre es obligatorio.';
    elementModal.appendChild(errorMessage);
    function validateForm() {
        const formulario = document.querySelector('.tab5-event');
        const nombre = formulario.elements.namedItem('Evento_nombre');
        if (!nombre || !nombre.value.trim()) {
            errorMessage.style.display = 'block';
            return false;
        }
        errorMessage.style.display = 'none';
        return true;
    }
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
    // // Función para llenar el formulario con los datos actuales
    const fillForm = (datos) => {
        const formulario = document.querySelector('.tab5-event');
        for (const [key, value] of Object.entries(datos)) {
            var keycheck = `${key}_check`;
            var keynombre = `${key}_nombre`;
            const element = formulario.elements.namedItem(keycheck);
            const element1 = formulario.elements.namedItem(keynombre);
            const idelement = formulario.elements.namedItem('id');
            if (element) {
                // console.log('datos', datos);
                console.log('element', element);
                if (element.type === 'checkbox') {
                    element.checked = value.check;
                    console.log('element.checked', value);
                } else if (element.type === 'select-one') {
                    element.value = value; // assuming value is an object with a path
                } else {
                    element.value = value;
                }
            }
            if (element1) {
                console.log('elemet1', element1);

                element1.value = value.nombre || value;
            } else {
                console.warn(`Elemento con nombre ${key} no encontrado en el formulario.`);
            }
            if (idelement) {
                idelement.value = datos.id
                console.log('id', datos.id);
            }
        }
    };

    elementModal.querySelector('.modalEventAdd').addEventListener('click', (event) => {
        if (!validateForm()) {
            
            return;
        }
        let nameFilter = {};
        nameFilter = obtenerDatos();

        if (nameFilter.id) {
            console.log('nameFilterid', nameFilter.id);
            saveData(nameFilter);
        } else {
            onSave(nameFilter);
        }
        elementModal.style.display = 'none';
        
    });
    function obtenerDatos() {
        const formulario = document.querySelector('.tab5-event');
        const datosFormulario = new Map();
        const nameFilter = {};
        for (const elemento of formulario.elements) {
            if (elemento.name) {
                if (elemento.type === 'checkbox') {
                    datosFormulario.set(elemento.name, elemento.checked);
                } else if (elemento.type === 'select-one') {
                    datosFormulario.set(elemento.name, cacheAssign[elemento.value]);
                } else {
                    datosFormulario.set(elemento.name, elemento.value);
                }
                nameFilter[(elemento.name).split(separator)[0]] = [];
            }
        }
        const retornoDatos = Object.fromEntries(datosFormulario);
        Object.keys(nameFilter).forEach((key) => {
            const KeysFilter = Object.fromEntries(
                Object.entries(retornoDatos).filter(([clave, valor]) => clave.includes(key + separator))
            );
            const ResultSpited = {};
            Object.entries(KeysFilter).forEach(([clave, valor]) => {
                ResultSpited[clave.split(separator)[1]] = valor;
            });
            nameFilter[key] = ResultSpited;
        });
    
        // Verificar y convertir id a un número entero válido
        const idValue = formulario.elements.namedItem('id').value;
        const id = parseInt(idValue, 10);
        nameFilter.id = !isNaN(id) ? id : null;
        console.log('nameFilter', nameFilter, datosFormulario, "datosFormulario");
        return nameFilter;
    }
    
    elementModal.querySelector('.modalEventClose').addEventListener('click', (event) => {
        const nameFilter = obtenerDatos();
        console.log('nameFilter', nameFilter);
        elementModal.style.display = 'none';
        
        onCancel();
    });
    elementModal.querySelector('.modalEventSave').addEventListener('click', (event) => {
        if (!validateForm()) {
            
            return;
        }
        const nameFilter = obtenerDatos();
        
        elementModal.style.display = 'none';
        if (nameFilter.id) {
            console.log('nameFilterid', nameFilter.id);
            saveData(nameFilter);
        } else {
            onSave(nameFilter);
        }
    });
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
    elementModal.querySelectorAll('.inputSelectSources').forEach(elementHTML => {
        function loadDataFromIndexedDB(dbConfig) {

        openDatabase(dbConfig).then((db) => {
            const transaction = db.transaction([dbConfig.store], 'readonly');
            const objectStore = transaction.objectStore(dbConfig.store);
            const request = objectStore.getAll();
            
            request.onsuccess = (event) => {
                const allRecords = event.target.result;
                allRecords.forEach(record => {
                    console.log('record', record);
                    console.log('record.name', record.evento);
                    const optionElement = document.createElement('option');
                    optionElement.textContent = record.evento;
                    optionElement.value = record;
                    elementHTML.appendChild(optionElement);
                    cacheAssign[record] = record;

                });
            };
            request.onerror = (event) => {
                console.error('Error loading data from IndexedDB', event.target.error);
            };
        }).catch((error) => {
            console.error('Error opening IndexedDB', error);
        });
    }
    loadDataFromIndexedDB(databases.MyDatabaseActionevent);
    });

    return {
        element: ModalElement,
        form: form,
        close: () => elementModal.style.display = 'none',
        open: () => {
            elementModal.style.display = 'flex';
            elementModal.querySelector('.modalEventSave').style.display = 'inline-block';
        },
        onUpdate: (datos) => {
            if (datos) {
                fillForm(datos); // Llenar el formulario con los datos actuales
            }
            elementModal.style.display = 'flex';
    
            // Actualizar datos con la función saveData
            // saveData(datos);
    
            // Mostrar botón Guardar y ocultar botones Agregar y Cerrar
            elementModal.querySelector('.modalEventAdd').style.display = 'none';
            elementModal.querySelector('.modalEventSave').style.display = 'inline-block';
        },
    };
}
