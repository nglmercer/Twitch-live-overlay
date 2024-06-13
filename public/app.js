document.getElementById("listenBtn").addEventListener("click", function(event){
  event.preventDefault()
});


class Validator {
/*
     * Determina si el nombre del canal es válido
     * la cadena de parámetros es el nombre del canal
   */
  isAZ(string) {
    var res = string.match(/^(#)?[a-zA-Z0-9_]{4,25}$/); 
    return (res !== null)
  }
}
  

class TTS {
/*
     * En construcción
     * Hablar mensaje, determinar si Polly está marcada
     * Escribir mensaje independientemente
   */
  constructor(message, tags) {
    this.speak(message, tags, this.speechType(), this.announceFlag());
    this.write(message, tags); 
  }
/*
     * Determina si se utilizará Polly o voz basada en navegador.
   */
  speechType() {
    if(!document.getElementById('hqspeech').checked) {
      return 'browser';
    }
    if(document.getElementById('hqspeech').checked) {
      return 'browser';
    }
  }
/*
     * Habla un mensaje
     * el mensaje de parámetro es el mensaje de contracción de tmi.js
     * las etiquetas param son las etiquetas enviadas a través de tmi.js
     * El tipo de parámetro habla a través de Polly o del navegador.
   */
  announceFlag() {
    if(document.getElementById('announcechatter').checked) {
      return true; 
    }
    if(!document.getElementById('announcechatter').checked) {
      return false; 
    }    
  }

  speak(message, tags, type, announceflag) {
    if(type == 'browser') {
      if(announceflag == true) {
        var chatter = tags['display-name']; 
        // lee el mensaje
        message = chatter+" dice "+message;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = document.querySelector('#volume').value;

      const voices = speechSynthesis.getVoices();
      var voiceSelect = document.getElementById('voiceSelect');
      const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");
      for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === selectedOption) {
          utterance.voice = voices[i];
        }
      }

      window.speechSynthesis.speak(utterance);
      document.getElementById("audiotrack").pause();
      document.getElementById("audiotrack").currentTime = 0;
    }
  }
/*
     * escribir un mensaje al navegador
     * el mensaje de parámetro es el mensaje de contracción de tmi.js
     * las etiquetas param son las etiquetas enviadas a través de tmi.js
   */
  write(message, tags) {
    let div = document.createElement('div'); 
    div.className = "single-message";

    let chatter = document.createElement('span'); 
    chatter.className= "chatter";
    chatter.style.color = tags['color'];
    chatter.textContent = tags['display-name']+': ';

    let chatMessage = document.createElement('span'); 
    chatMessage.className= "messageContent"; 
    chatMessage.textContent = message; 

    div.appendChild(chatter); 
    div.appendChild(chatMessage); 

    document.getElementById("messages").appendChild(div); 
  }
}
  /*
    * Starts routing the request
    * Validates the channel name 
    * if valid, starts listening for messages
  */
const eventselects = ['chat', 'bits', 'sub', 'resub', 'logon'];
function startListening() {
  var validator = new Validator;
  const statusElement = document.querySelector('#status'); 
  const channel = document.querySelector("#channelname").value;
  if(validator.isAZ(channel) == false) {
    statusElement.className = "alert alert-danger"; 
    statusElement.textContent = "Please enter a valid channel name."; 
  }
  else {
    const client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [channel],
    });

    document.getElementById("listenBtn").textContent = "Listening...";
    document.getElementById("listenBtn").disabled = true; 
    statusElement.className = "alert alert-success"; 

    client.connect().then(() => {
      statusElement.textContent = `Connected to twitch. Listening for messages in ${channel}...`;
    });

    client.on('message', (wat, tags, message, self) => {
      manageOptions(tags, message);
      handleEvent('chat', tags, message);
      sendToServer('chat', message)
      console.log("wat:", wat);
      console.log("message event/ tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      eventmanager("chat", tags);
    });
    client.on('cheer', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("cheer event/ tags:", tags);
      console.log("message:", message);
      console.log("cheer/ self:", self);
      manageEvent(tags, message);
      handleEvent('bits', tags, message);
      eventmanager("cheer", tags);

    });
    
    client.on('sub', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("sub event:","tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      manageEvent('likes', tags);
      eventmanager("sub", tags);
    });
    
    client.on('resub', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("resub event/tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      manageEvent(tags, message);
      eventmanager("resub", tags);
    });
    
    client.on("logon", (tags) => {
      console.log("tags:", tags);
      console.log("logon-success");
      eventmanager("logon", tags);
    });
  }
}


function manageEvent(tags, message, userstate) {
  new TTS(message, tags, userstate);
  console.log('not in lines');
}
const request1 = indexedDB.open("giftlistDatabase", 1);
// console.log("request",request1);
let dataMinecraft = JSON.parse(localStorage.getItem('dataminecraft'));
let keyplayerName = dataMinecraft && dataMinecraft['playerName'] 
    ? dataMinecraft['playerName'] 
    : document.getElementById('playerNameInput').value;console.log("keyplayerName?=",keyplayerName);
let currentPlayerIndex = 0;
const COMMAND_LIMIT = 1; // Límite de comandos por minuto
const DELAY_PER_COMMAND = 10; // Retraso en milisegundos por cada comando adicional
let commandCount = 0;

function testHandleEvent() {
  var eventType = document.getElementById('eventType').value;
  var data = document.getElementById('data').value;
  
  if (!['gifts', 'comments', 'likes', 'subscribes', 'chat'].includes(eventType)) {
    console.error("Invalid event type:", eventType);
    return;
  }

  const transaction = db.transaction([eventType], "readonly");
  const objectStore = transaction.objectStore(eventType);

  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const allEvents = event.target.result;
    console.log(`All ${eventType}:`, allEvents);

    const trimmedData = data.trim().toLowerCase();
    const foundEvent = allEvents.find(event => event.title.toLowerCase() === trimmedData || event.description.toLowerCase() === trimmedData);
    console.log (foundEvent);
    if (foundEvent) {
      const eventCommands = foundEvent.description;
      window.api.sendChatMessage(`${eventType} ${eventCommands}`);
      Replacecommandtest(eventCommands);
      // console.log(`eventType ${eventType} find:`, eventType, eventCommands);
    } else {
      console.log(`eventType ${eventType} else:`, eventType, data);
    }
  };

  request.onerror = (event) => {
    console.error(`Error fetching ${eventType} from IndexedDB:`, event.target.errorCode);
    console.log(`ONERROR testHandleEvent:`, eventType, data);
  };
}
const Replacecommandtest = (command) => {
  // console.log("eventype",eventype);
  let replacedCommand = command
    .replace('playername', keyplayerName || '')

  replacedCommand = replacedCommand.replace(/\\/g, '');
  replacedCommand = replacedCommand.toLowerCase();
  console.log("replacedCommand",replacedCommand);
  return replacedCommand;
}

function sendReplacedCommand(replacedCommand) {
  window.api.sendChatMessage(replacedCommand);
}
function handleEvent(eventType, tags, message) {
  const transaction = db.transaction([eventType], "readonly");
  const objectStore = transaction.objectStore(eventType);

  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const allEvents = event.target.result;
    console.log(`All ${eventType}:`, allEvents);

    const trimmedData = data.trim().toLowerCase();
    const foundEvent = allEvents.find(event => event.title.toLowerCase() === trimmedData || event.description.toLowerCase() === trimmedData);
    console.log (foundEvent);
    if (foundEvent) {
      const eventCommands = foundEvent.description;
      Replacevalues(eventCommands, tags, message);
      // console.log(`eventType ${eventType} find:`, eventType, eventCommands);
    } else {
      console.log(`eventType ${eventType} else:`, eventType, data);
    }
  };

  request.onerror = (event) => {
    console.error(`Error fetching ${eventType} from IndexedDB:`, event.target.errorCode);
    console.log(`ONERROR testHandleEvent:`, eventType, data);
  };
}
const Replacevalues = (command, tags, message) => {
  // console.log("eventype",eventype);
  let replacedCommand = command
    .replace('playername', keyplayerName || '')
    .replace('username', tags.username || '')
    .replace('message', message || '')
    .replace('bits', tags.bits || '')
    .replace('comment', message || '')
    .replace('gift', tags.bits || '')
    .replace('uniqueId', tags.username || '')

  replacedCommand = replacedCommand.replace(/\\/g, '');
  replacedCommand = replacedCommand.toLowerCase();

  return replacedCommand;
}

function manageOptions(tags, message) {
  const badges = tags.badges || {};
  const isBroadcaster = badges.broadcaster;
  const isMod = badges.moderator;

  const excludedchatterstextarea = document.getElementById('excluded-chatters');
  var lines = excludedchatterstextarea.value.split('\n');
  var lines = lines.map(line => line.toLowerCase());

  if(document.getElementById('modsonly').checked) {
    if(isBroadcaster || isMod ) {
      new TTS(message, tags);
      return;
    }
  }
  if (document.getElementById('cheersonly').checked) {
    if (tags.bits > 0) {
      new TTS(message, tags);
      return;
    }
  }
  if(document.getElementById('exclude-toggle').checked) {
    console.log(lines);
    if(lines.includes(tags['display-name'].toLowerCase())) {
      return;
    }
    else {
      new TTS(message, tags);
      console.log('not in lines');
      return;
    }
  }
  else {
    new TTS(message, tags); 
    return;
  }
}

/*
  * Changes the volume of Polly speech. 
*/
function volumeChange() {
  var currentVolume = document.querySelector('#volume').value;
  document.getElementById("audiotrack").volume = currentVolume;
}
/*
  * Starts stripe checkout
*/
function startCheckout() {
  var tipHandler = new Tip; 
  tipHandler.startCheckout(); 
}
/*
  * Checks the Tip value
*/
function valueCheck() {
  var tipHandler = new Tip; 
  tipHandler.valueCheck(); 
}

function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }
  const voices = speechSynthesis.getVoices();
  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    document.getElementById("voiceSelect").appendChild(option);
  }
}

function exportSettings() {
  var channelName = document.querySelector("#channelname").value;
  document.getElementById('settingsURL').value = "https://twitchtts.net?channelname="+channelName;
  if(channelName == "") {
    alert("You do not have a channel name entered. Please enter a channel name to generate a URL.");
    document.getElementById('settingsURL').value = "";
  }
}

function copyURL() {
  var copyText = document.getElementById('settingsURL');
  copyText.select(); 
  navigator.clipboard.writeText(copyText.value);
  alert("Copied URL to clipboard.");
}

function skipMessage() {
  //stops Polly Speech
  document.getElementById("audiotrack").pause();
  document.getElementById("audiotrack").currentTime = 0;

  //stops Browser speech
  window.speechSynthesis.cancel();
}

/*
  * If Channel Name is in the URL, autostart listening
*/

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if(urlParams.get('channelname') !== null) {
  document.querySelector("#channelname").value = urlParams.get('channelname');
  document.getElementById("hqspeech").checked = true;
  startListening();
};

window.speechSynthesis.onvoiceschanged = function() {
  populateVoiceList();
}
async function sendToServer(eventType, data) {
  fetch('localhost:8081/api/receive1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventType, data }),
    })
    .then(response => response.json())
    .then(data => {
      //log.console(data); // Maneja la respuesta del servidor si es necesario
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
/*
   Si la casilla de verificación está seleccionada para excluir a los usuarios del chat, muestre las opciones para ello.
*/
document.getElementById("exclude-toggle").addEventListener("change", function() {
  var options = document.getElementById('exclude-options');
  if(this.checked == true) {
    options.classList.remove('d-none');
  }
  if(this.checked == false) {
    options.classList.add('d-none');
  }
});

/*
   Completa la lista de usuarios excluidos del chat con una lista predefinida de robots de moderación conocidos.
*/
function fillInBots() {
  var excludedChatters = document.getElementById("excluded-chatters");
  excludedChatters.value = "Nightbot\nMoobot\nStreamElements\nStreamlabs\nFossabot";
}
