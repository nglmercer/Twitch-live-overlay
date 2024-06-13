// Importa los estilos CSS necesarios
// import './tab5-event.css';

// Función para construir la modal
export async function construirModal({ onSave = () => {}, onUpdate = () => {}, onCancel = () => {} } = {}) {
    // Crea el contenedor principal de la modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modalContainer';

    // Plantilla HTML de la modal
    const modalHTML = `
        <form class="tab5-event">
            <!-- Item 1 -->
            <div class="ElementITEM">
                <h1>Actions</h1>
            </div>  
            <!-- Item 1 -->

            <!-- Item 2 -->
            <div class="ElementITEM">
                <!-- Input 1 -->
                <div class="inputGroup">
                    <label for="modalactionsName" class="grid2cols">Nombre del evento</label> 
                    <input name="Evento_nombre" type="text" id="modalactionsName" placeholder="Modal Name" class="form-control" />
                </div>

                <!-- Input 2 -->
                <div class="inputGroup">
                    <label for="modaleventCheckbox1" class="grid2cols">Join</label> 
                    <input name="Join_check" type="checkbox" id="modaleventCheckbox1" class="form-control" />
                </div>

                <!-- Input 3 -->
                <div class="inputGroup">
                    <label for="modalactionsCheckbox2" class="grid2cols">Follow</label>
                    <input name="Follow_check" type="checkbox" id="modalactionsCheckbox2" class="form-control" />
                </div>

                <!-- Input 4 -->
                <div class="inputGroup">
                    <label for="modalactionsCheckbox3" class="grid2cols">Chat</label>
                    <input name="Chat_check" type="checkbox" id="modalactionsCheckbox3" class="form-control" />
                </div>

                <!-- Input 5 -->
                <div class="inputGroup">
                    <label for="modalactionsCheckbox4" class="grid2cols">Bits</label>
                    <input name="Bits_check" type="checkbox" id="modalactionsCheckbox4" class="form-control" />

                    <!-- Config -->
                    <div class="config">
                        <input type="number" name="Bits_input" class="form-control inputSelectSources" />
                    </div>
                    <!-- Config -->
                </div>

                <!-- Input 6 -->
                <div class="inputGroup">
                    <label for="modalactionsCheckbox5" class="grid2cols">Action</label>
                    <input name="Action_check" type="checkbox" id="modalactionsCheckbox5" checked />

                    <!-- Config -->
                    <div class="config">
                        <select name="Action_select" class="form-control inputSelectSources"></select>
                    </div>
                    <!-- Config -->
                </div>

                <!-- Input 7 -->
                <div class="inputGroup">
                    <input name="id" type="hidden" id="modaleventsName" />
                </div>
            </div>  
            <!-- Item 2 -->

            <!-- Item 3 -->
            <div class="ElementITEM">
                <button class="btn btn-primary modalEventAdd">Add Event</button>
                <button class="btn btn-primary modalEventSave" style="display: none;">Guardar</button>
                <button class="btn btn-primary modalEventClose">Close</button>
            </div>  
            <!-- Item 3 -->
        </form>
    `;

    // Asigna el HTML a modalContainer
    modalContainer.innerHTML = modalHTML;

    // Agrega la modalContainer al cuerpo del documento
    document.body.appendChild(modalContainer);

    // Manejo de eventos
    const form = modalContainer.querySelector('.tab5-event');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    modalContainer.querySelector('.modalEventAdd').addEventListener('click', async (event) => {
        // Lógica para agregar evento
        onSave();
        ocultarModal(modalContainer);
    });

    modalContainer.querySelector('.modalEventClose').addEventListener('click', (event) => {
        // Lógica para cerrar la modal
        onCancel();
        ocultarModal(modalContainer);
    });

    // Función para llenar los datos en la modal
    function llenarModal(datos) {
        const formulario = modalContainer.querySelector('.tab5-event');
        for (const [key, value] of Object.entries(datos)) {
            const element = formulario.elements.namedItem(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        }
    }

    // Función para mostrar la modal
    function mostrarModal() {
        modalContainer.style.display = 'block';
    }

    // Función para ocultar la modal
    function ocultarModal() {
        modalContainer.style.display = 'none';
    }

    // Devuelve referencias útiles y funciones
    return {
        modalContainer,
        form,
        mostrarModal,
        ocultarModal,
        llenarModal
    };
}

// Ejemplo de uso:
const { mostrarModal, llenarModal, ocultarModal } = await construirModal({
    onSave: () => {
        console.log('Evento guardado');
        // Lógica para guardar el evento
    },
    onCancel: () => {
        console.log('Modal cerrada sin guardar');
        // Lógica para cancelar y cerrar la modal
    }
});

// Mostrar la modal
mostrarModal();

// Llenar la modal con datos
const datosEjemplo = {
    Evento_nombre: 'Ejemplo de evento',
    Join_check: true,
    Follow_check: false,
    Chat_check: true,
    Bits_check: false,
    Bits_input: 25,
    Action_check: true,
    Action_select: 'opción1',
    id: '12345'
};
llenarModal(datosEjemplo);
