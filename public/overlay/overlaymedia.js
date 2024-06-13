export default async function overlaymedia({ modalevent, Position = () => { }, overlay = () => { }, dataoverlay = () => { }, open = () => { }, close = () => { }, openreturn = () => { }, closereturn = () => { } }) {
    const ModalElement = document.createElement('div');
    ModalElement.innerHTML = await (await fetch('./overlay/overlay.html')).text();
    const idModal = `ModalElement${Math.floor(Math.random() * 1000)}`;
    ModalElement.id = idModal;
    modalevent.parentNode.insertBefore(ModalElement, modalevent.nextSibling);
    modalevent.remove();
    const elementModal = document.getElementById(idModal);
    // elementModal.querySelector('.tab5-event').addEventListener('submit', event => {
    //     event.preventDefault();
    // });
    function randomPosition() {
        const x = Math.floor(Math.random() * (window.innerWidth - 200));
        const y = Math.floor(Math.random() * (window.innerHeight - 200));
        return { x, y };
    }
    function randomSize() {
        const width = Math.floor(Math.random() * (window.innerWidth - 200));
        const height = Math.floor(Math.random() * (window.innerHeight - 200));
        return { width, height };
    }
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
      
      // Crear una matriz de posiciones predefinida
      let positions = [];
      for (let x = 8; x <= 88; x += 4) {
        for (let y = 8; y <= 88; y += 4) {
            positions.push({ x, y });
        }
      }
      
      // Barajar el array de posiciones
      positions = shuffleArray(positions);
    function overlayinrandompositionordefault(overlayposition) {
        defaultposition = 50;
        if (overlayposition) {
            const { x, y } = overlayposition;
        } else if (overlayposition => 90 && overlayposition <= 10) {
            overlayposition = positions
        } else{
            const {x, y} = defaultposition;
        }
        return overlayposition;
    }
    return {
        Position: () => {
            console.log('randomPosition');
        },
        overlay: () => {
            console.log('randomSize');
        },
        dataoverlay: () => {
            console.log('dataoverlay');
        },
        open: () => {
            openreturn();
        },
        close: () => {
            closereturn();
        }
    }
}