export default async function tab5Action({ elementContainer, files = [], onSave = () => { }, saveData = () => { }, onCancel = () => { }, separator = "_" }) {
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
    elementModal.querySelector('.tab5-action').addEventListener('submit', event => {
        event.preventDefault();
    });

    // Función para llenar el formulario con los datos actuales
    const fillForm = (datos) => {
        const formulario = document.querySelector('.tab5-action');
        for (const [key, value] of Object.entries(datos)) {
            console.log('datos', datos);

            // console.log('Buscando elemento:', key); // Añadido
            var keycheck = `${key}_check`;
            var keynombre = `${key}_nombre`;
            const element = formulario.elements.namedItem(keycheck);
            const element1 = formulario.elements.namedItem(keynombre);
            const idelement = formulario.elements.namedItem('id');
            // console.log('Elemento encontrado 0:', formulario.elements); // Añadido
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'select-one') {
                    element.value = value.path || value; // No asumimos que value es un objeto con path
                } else{
                    element.value = value;
                }
            } else {
                console.warn(`Elemento con nombre ${key} no encontrado en el formulario.`);
            }
            if (element1) {
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

    elementModal.querySelector('.modalActionAdd').addEventListener('click', () => {
        const nameFilter = obtenerDatos();

        // Llamar a onSave o saveData según corresponda
        if (nameFilter.id) {
            console.log('nameFilterid', nameFilter.id);
            saveData(nameFilter);
        } else {
            onSave(nameFilter);
        }

        elementModal.style.display = 'none';
    });
    function obtenerDatos() {
        const formulario = document.querySelector('.tab5-action');
        const datosFormulario = new Map();
        const nameFilter = {};
        for (const elemento of formulario.elements) {
            if (elemento.name) {
                if (elemento.type === 'checkbox') {
                    datosFormulario.set(elemento.name, elemento.checked);
                } else if (elemento.type === 'select-one') {
                    datosFormulario.set(elemento.name, cacheAssign[elemento.value] || elemento.value); // Usar cacheAssign si está disponible
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

        // Incluir el ID si existe
        nameFilter.id = parseInt(formulario.elements.namedItem('id').value);
        elementModal.style.display = 'none';
        console.log('nameFilter', nameFilter, datosFormulario,"datosFormulario");
        return nameFilter;
    }
    elementModal.querySelector('.modalActionClose').addEventListener('click', () => {
        elementModal.style.display = 'none';
        onCancel();
    });
    elementModal.querySelector('.modalActionSave').addEventListener('click', () => {
        const nameFilter = obtenerDatos();
        elementModal.style.display = 'none';
        saveData(nameFilter);
    });
    elementModal.querySelectorAll('.inputSelectSources').forEach(elementHTML => {
        files.forEach(file => {
            console.log('file', file);
            const optionElement = document.createElement('option');
            optionElement.textContent = file.name;
            optionElement.value = file.path;
            elementHTML.appendChild(optionElement);
            cacheAssign[file.path] = file;
        });
    });

    return {
        element: ModalElement,
        form: elementModal.querySelector('.tab5-action'),
        close: () => elementModal.style.display = 'none',
        open: (datos) => {
            if (datos) {
                fillForm(datos); // Llenar el formulario con los datos actuales
                elementModal.querySelector('.modalActionSave').style.display = 'inline-block';
            }
            elementModal.style.display = 'flex';
        },
        onUpdate: (datos) => {
            if (datos) {
                fillForm(datos); // Llenar el formulario con los datos actuales
            }
            elementModal.style.display = 'flex';
    
            // Actualizar datos con la función saveData
            saveData(datos);
    
            // Mostrar botón Guardar y ocultar botones Agregar y Cerrar
            elementModal.querySelector('.modalActionAdd').style.display = 'none';
            elementModal.querySelector('.modalActionSave').style.display = 'inline-block';
        },
    };
}
