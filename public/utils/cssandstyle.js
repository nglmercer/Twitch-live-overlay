// select.js
async function createElementWithstyles(elementhtml) {
    switch (elementhtml) {
        case 'deletebutton':
            elementhtml.style.color = 'white';
            elementhtml.style.width = '100%';
            elementhtml.style.height = '100%';
            elementhtml.style.backgroundColor = 'red';
            elementhtml.style.textAlign = 'center';
            elementhtml.style.padding = '10px';
            elementhtml.style.margin= '10px';
            break;
        case 'editbutton':
            elementhtml.style.color = 'white';
            elementhtml.style.width = '100%';
            elementhtml.style.height = '100%';
            elementhtml.style.backgroundColor = 'blue';
            elementhtml.style.textAlign = 'center';
            elementhtml.style.padding = '10px';
            elementhtml.style.margin= '10px';
            break;
        case 'testbutton':
            elementhtml.style.color = 'white';
            elementhtml.style.width = '100%';
            elementhtml.style.height = '100%';
            elementhtml.style.backgroundColor = 'green';
            elementhtml.style.textAlign = 'center';
            elementhtml.style.padding = '10px';
            elementhtml.style.margin= '10px';
            break;
    }

}