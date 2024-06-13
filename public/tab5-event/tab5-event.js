import { databases, saveDataToIndexedDB, deleteDataFromIndexedDB, updateDataInIndexedDB, loadDataFromIndexedDB, getDataFromIndexedDB } from '../indexedDB.js';

export default async function tab5Event({ elementContainer, files = [], onSave = () => { }, onUpdate = () => { }, saveData = () => { }, onCancel = () => { }, separator = "_" }) {
    const ModalElement = document.createElement('div');
    const idModal = `ModalElement${Math.floor(Math.random() * 1000)}`;
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

    const fillForm = (datos) => {
        const formulario = document.querySelector('.tab5-event');
        for (const [key, value] of Object.entries(datos)) {
            var keycheck = `${key}_check`;
            var keynombre = `${key}_nombre`;
            const element = formulario.elements.namedItem(keycheck);
            const element1 = formulario.elements.namedItem(keynombre);
            const idelement = formulario.elements.namedItem('id');
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value.check;
                } else if (element.type === 'select-one') {
                    element.value = value; 
                } else {
                    element.value = value;
                }
            }
            if (element1) {
                element1.value = value.nombre || value;
            }
            if (idelement) {
                idelement.value = datos.id;
            }
        }
    };

    elementModal.querySelector('.modalEventAdd').addEventListener('click', async (event) => {
        if (!validateForm()) {
            return;
        }
        let nameFilter = obtenerDatos();
        if (nameFilter.id) {
            await updateDataInIndexedDB(databases.eventsDB, nameFilter);
        } else {
            await saveDataToIndexedDB(databases.eventsDB, nameFilter);
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

        const idValue = formulario.elements.namedItem('id').value;
        const id = parseInt(idValue, 10);
        nameFilter.id = !isNaN(id) ? id : null;
        return nameFilter;
    }

    elementModal.querySelector('.modalEventClose').addEventListener('click', (event) => {
        elementModal.style.display = 'none';
        onCancel();
    });

    elementModal.querySelector('.modalEventSave').addEventListener('click', async (event) => {
        if (!validateForm()) {
            return;
        }
        const nameFilter = obtenerDatos();
        elementModal.style.display = 'none';
        if (nameFilter.id) {
            await updateDataInIndexedDB(databases.eventsDB, nameFilter);
        } else {
            await saveDataToIndexedDB(databases.eventsDB, nameFilter);
        }
    });

    elementModal.querySelectorAll('.inputSelectSources').forEach(elementHTML => {
        loadDataFromIndexedDB(databases.MyDatabaseActionevent, (dbConfig, record) => {
            const optionElement = document.createElement('option');
            optionElement.textContent = record.evento.nombre;
            optionElement.value = record.id;
            elementHTML.appendChild(optionElement);
            cacheAssign[record.id] = record;
        });
    });

    return {
        element: ModalElement,
        form: form,
        close: () => elementModal.style.display = 'none',
        open: () => {
            elementModal.style.display = 'flex';
            elementModal.querySelector('.modalEventSave').style.display = 'none';
        },
        onUpdate: async (datos) => {
            if (datos) {
                fillForm(datos);
            }
            elementModal.style.display = 'flex';
            updateDataInIndexedDB(databases.eventsDB, datos);
            elementModal.querySelector('.modalEventSave').style.display = 'inline-block';
        },
    };
}
