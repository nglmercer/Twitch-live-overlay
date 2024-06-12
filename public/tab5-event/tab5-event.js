export default async function tab5Action({ elementContainer, files = [], onSave = () => { }, onCancel = () => { }, separator = "_" }) {
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
    // fix Uncaught (in promise) TypeError: Cannot read properties of null (reading 'addEventListener') at tab5Action (tab5-event.js:13:46) entonces el codigo siguiente seria para         event.preventDefault();
    // elementModal.querySelector('.tab5-event').addEventListener('submit', event => {
    //     event.preventDefault();
    // });
    console.log('elementModal', elementModal.querySelector('.tab5-event'));
    console.log('idmodal', idModal);
    // // Función para llenar el formulario con los datos actuales
    const fillForm = (datos) => {
        const formulario = document.querySelector('.tab5-event');
        console.log('datos', datos);
        for (const [key, value] of Object.entries(datos)) {
            const element = formulario.elements.namedItem(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'select-one') {
                    element.value = value.path; // assuming value is an object with a path
                } else {
                    element.value = value;
                }
            }
        }
    };

    elementModal.querySelector('.modalEventAdd').addEventListener('click', (event) => {
        const formulario = document.querySelector('.tab5-event');
        const datosFormulario = new Map();
        const nameFilter = {};
        for (const elemento of formulario.elements) {
            if (elemento.name) {
                if (elemento.type === 'checkbox') {
                    // Si es un checkbox, agregar un valor booleano
                    datosFormulario.set(elemento.name, elemento.checked);
                } else if (elemento.type == "select-one") {
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

        // Include the ID if it exists
        if (formulario.elements.namedItem('id')) {
            nameFilter.id = formulario.elements.namedItem('id').value;
        }

        onSave(nameFilter);
        elementModal.style.display = 'none';
        event.preventDefault();
    });

    elementModal.querySelector('.modalEventClose').addEventListener('click', (event) => {
        elementModal.style.display = 'none';
        event.preventDefault();
        onCancel();
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
        // files es un array files[Array(5)]0:Array(5)0:"chat"1:"bits"2:"sub"3:"resub"4:"logon"length:5 entonces para cada elemento de files
        // files.forEach(data => {
        //     const optionElement = document.createElement('option');
        //     optionElement.textContent = data;
        //     optionElement.value = data;
        //     elementHTML.appendChild(optionElement);
        //     cacheAssign[data] = data;
        //     // if (Array.isArray(data) && data.length > 0) {
        //     //     const file = data[0];
        //     //     const optionElement = document.createElement('option');
        //     //     optionElement.textContent = file;
        //     //     optionElement.value = file;
        //     //     elementHTML.appendChild(optionElement);
        //     //     cacheAssign[file] = file;
        //     // } else {
        //     //     console.error('data is not a valid array or is empty:', data);
        //     // }
        // });
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
        form: elementModal.querySelector('.tab5-event'),
        close: () => elementModal.style.display = 'none',
        open: (datos) => {
            if (datos) {
                fillForm(datos); // Llenar el formulario con los datos actuales
            }
            elementModal.style.display = 'flex';
        }
    };
}
