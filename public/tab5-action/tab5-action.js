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
    form.addEventListener('submit', event => {
        event.preventDefault();
    });

    let errorMessage = createErrorMessage();
    elementModal.appendChild(errorMessage);

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);

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

    function fillForm(datos) {
        for (const [key, value] of Object.entries(datos)) {
            const keyCheck = `${key}_check`;
            const keyNombre = `${key}_nombre`;
            const keyselect = `${key}_select`;
            const element = form.elements.namedItem(keyCheck);
            const element1 = form.elements.namedItem(keyNombre);
            const element2 = form.elements.namedItem(keyselect);
            const idElement = form.elements.namedItem('id');
            console.log(element2)
            if (element) {
                // console.log('key', key, 'value', value);
                // console.log('element', element);
                if (element.type === 'checkbox') {
                    element.checked = value.check;
                }
            } else if (element1) {
                // console.log('key', key, 'value', value);
                // console.log('element1', element1);
                element1.value = value.nombre || value;
            } 
            else if (idElement) {
                idElement.value = datos.id;
            } else if (element2) {
                console.log('key', key, 'value', value);
                console.log('element2', element2);
                element2.value = value.select.name;
            } else {
                console.warn(`Elemento con nombre ${key} no encontrado en el formulario.`);
            }
        }
    }

    function clearForm() {
        for (const elemento of form.elements) {
            if (elemento.type === 'checkbox') {
                elemento.checked = false;
            } else if (elemento.type === 'select-one') {
                elemento.value = "";
            } else {
                elemento.value = "";
            }
        }
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
        if (!validateForm()) {
            return;
        }
        const nameFilter = obtenerDatos();
        if (nameFilter.id) {
            saveData(nameFilter);
        } else {
            onSave(nameFilter);
        }
        elementModal.style.display = 'none';
    });

    elementModal.querySelector('.modalActionClose').addEventListener('click', () => {
        elementModal.style.display = 'none';
        onCancel();
    });

    elementModal.querySelector('.modalActionSave').addEventListener('click', () => {
        if (!validateForm()) {
            return;
        }
        const nameFilter = obtenerDatos();
        elementModal.style.display = 'none';
        saveData(nameFilter);
    });

    elementModal.querySelectorAll('.inputSelectSources').forEach(elementHTML => {
        files.forEach(file => {
            const optionElement = document.createElement('option');
            optionElement.textContent = file.name;
            optionElement.value = file.path;
            elementHTML.appendChild(optionElement);
            cacheAssign[file.path] = file;
        });
    });

    return {
        element: ModalElement,
        form: form,
        close: () => elementModal.style.display = 'none',
        open: () => {
            elementModal.style.display = 'flex';
            clearForm();
            elementModal.querySelector('.modalActionSave').style.display = 'inline-block';
        },
        onUpdate: (datos) => {
            if (datos) {
                fillForm(datos);
            }
            elementModal.style.display = 'flex';
            elementModal.querySelector('.modalActionAdd').style.display = 'none';
            elementModal.querySelector('.modalActionSave').style.display = 'inline-block';
        }
    };
}
