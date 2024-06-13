import { databases, saveDataToIndexedDB, deleteDataFromIndexedDB, updateDataInIndexedDB, loadDataFromIndexedDB, getDataFromIndexedDB } from '../indexedDB.js';

export default async function tab5Action({
    elementContainer,
    files = [],
    onSave = () => {},
    onUpdate = () => {},
    saveData = () => {},
    onCancel = () => {},
    separator = "_"
}) {
    const ModalElement = document.createElement('div');
    const idModal = `ModalElement${Math.floor(Math.random() * 1000)}`;
    const cacheAssign = {};

    ModalElement.className = 'modalElement';
    ModalElement.id = idModal;
    ModalElement.innerHTML = await (await fetch('./tab5-action/tab5-action.html')).text();
    elementContainer.parentNode.insertBefore(ModalElement, elementContainer.nextSibling);
    elementContainer.remove();

    const elementModal = document.getElementById(idModal);
    elementModal.style.display = 'none';

    const form = elementModal.querySelector('.tab5-action');
    form.addEventListener('submit', event => event.preventDefault());

    let errorMessage = createErrorMessage();
    elementModal.appendChild(errorMessage);

    setTimeout(() => errorMessage.style.display = 'none', 5000);

    function createErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.display = 'none';
        errorDiv.textContent = 'El nombre es obligatorio.';
        return errorDiv;
    }

    function validateForm() {
        const nombre = form.elements.namedItem('evento_nombre');
        if (!nombre || !nombre.value.trim()) {
            errorMessage.style.display = 'block';
            return false;
        }
        errorMessage.style.display = 'none';
        return true;
    }

    function obtenerDatos() {
        const datosFormulario = new Map();
        const nameFilter = {};

        for (const elemento of form.elements) {
            if (elemento.name) {
                if (elemento.type === 'checkbox') {
                    datosFormulario.set(elemento.name, elemento.checked);
                } else if (elemento.type === 'select-one') {
                    datosFormulario.set(elemento.name, cacheAssign[elemento.value] || elemento.value);
                } else {
                    datosFormulario.set(elemento.name, elemento.value);
                }
                nameFilter[(elemento.name).split(separator)[0]] = [];
            }
        }

        const retornoDatos = Object.fromEntries(datosFormulario);
        Object.keys(nameFilter).forEach((key) => {
            const keysFilter = Object.fromEntries(
                Object.entries(retornoDatos).filter(([clave, valor]) => clave.includes(key + separator))
            );
            const resultSplitted = {};
            Object.entries(keysFilter).forEach(([clave, valor]) => {
                resultSplitted[clave.split(separator)[1]] = valor;
            });
            nameFilter[key] = resultSplitted;
        });

        const idValue = form.elements.namedItem('id').value;
        nameFilter.id = parseInt(idValue, 10) || null;

        return nameFilter;
    }

    elementModal.querySelector('.modalActionAdd').addEventListener('click', () => {
        if (!validateForm()) return;
        const nameFilter = obtenerDatos();
        if (nameFilter.id) {
            console.log('nameFilterid', nameFilter.id);
            updateDataInIndexedDB(databases.MyDatabaseActionevent, nameFilter);
        } else {
            saveDataToIndexedDB(databases.MyDatabaseActionevent, nameFilter);
        }
        elementModal.style.display = 'none';
    });

    elementModal.querySelector('.modalActionClose').addEventListener('click', () => {
        elementModal.style.display = 'none';
        onCancel();
    });

    elementModal.querySelector('.modalActionSave').addEventListener('click', () => {
        if (!validateForm()) return;
        const nameFilter = obtenerDatos();
        elementModal.style.display = 'none';
        if (nameFilter.id) {
            console.log('nameFilterid', nameFilter.id);
            updateDataInIndexedDB(databases.MyDatabaseActionevent, nameFilter);
        } else {
            saveDataToIndexedDB(databases.MyDatabaseActionevent, nameFilter);
        }
    });

    function loadOptions(elementModal, files) {
        elementModal.querySelectorAll('.inputSelectSources').forEach(elementHTML => {
            elementHTML.innerHTML = '';
            files.forEach(file => {
                const optionElement = document.createElement('option');
                optionElement.textContent = file.name;
                optionElement.value = file.path;
                elementHTML.appendChild(optionElement);
                cacheAssign[file.path] = file;
            });
        });
    }

    function loadDataFromIndexedDBToForm(dbConfig) {
        loadDataFromIndexedDB(dbConfig).then(records => {
            records.forEach(record => {
                const optionElement = document.createElement('option');
                optionElement.textContent = record.name;
                optionElement.value = record.id;
                form.elements.namedItem('inputSelectSources').appendChild(optionElement);
                cacheAssign[record.id] = record;
            });
        }).catch(error => console.error('Error loading data from IndexedDB', error));
    }

    loadOptions(elementModal, files);

    return {
        element: ModalElement,
        form: form,
        close: () => elementModal.style.display = 'none',
        open: (setNewFiles = null) => {
            if (setNewFiles !== null) {
                loadOptions(elementModal, setNewFiles);
            } else {
                loadOptions(elementModal, files);
            }
            elementModal.style.display = 'flex';
            elementModal.querySelector('.modalActionSave').style.display = 'inline-block';
        },
        onUpdate: (datos) => {
            elementModal.style.display = 'flex';
            console.log('nameFilterid', datos.id);
            updateDataInIndexedDB(databases.MyDatabaseActionevent, datos);
            elementModal.querySelector('.modalActionAdd').style.display = 'none';
            elementModal.querySelector('.modalActionSave').style.display = 'inline-block';
        },
        loadIndexedDB: () => {
            loadDataFromIndexedDBToForm(databases.MyDatabaseActionevent);
        },
    };
}

