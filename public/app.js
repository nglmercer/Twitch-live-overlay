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
      console.log("wat:", wat);
      console.log("message event/ tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
    });
    client.on('cheer', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("cheer event/ tags:", tags);
      console.log("message:", message);
      console.log("cheer/ self:", self);
      manageEvent(tags, message);
      handleEvent('bits', tags, message);

    });
    
    client.on('sub', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("sub event:","tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      manageEvent('likes', tags);
    });
    
    client.on('resub', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("resub event/tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      manageEvent(tags, message);
    });
    
    client.on("logon", (tags) => {
      console.log("tags:", tags);
      console.log("logon-success");
    });
  }
}
function manageEvent(tags, message, userstate) {
  new TTS(message, tags, userstate);
  console.log('not in lines');
}
const keyplayerName = localStorage.getItem('playerName') || 'defaultPlayerName';
let commandList = null;
let lastCommand = null;
const playerNames = [`${keyplayerName}`, `${keyplayerName}`];
const commandListInput = localStorage.getItem('commandList');
let currentPlayerIndex = 0;
if (keywordsInput) {
  keywords = jsyaml.load(keywordsInput); // Asignar los datos cargados desde el localStorage a 'keywords'
} else {
  keywords = {}; // Asignar un objeto vacío si no hay datos en el localStorage
}
if (commandListInput) {
  commandList = jsyaml.load(commandListInput);
} else {
  commandList = {};
}
function testHandleEvent() {
  var eventType = document.getElementById('eventType').value;
  var data = document.getElementById('data').value;
  let playerName = null;
  let eventCommands = [];

  if (playerNames[currentPlayerIndex] === undefined || playerNames[currentPlayerIndex].length < 2) {
    playerName = `${keyplayerName}`;
  } else {
    playerName = playerNames[currentPlayerIndex];
  }

  currentPlayerIndex++;
  if (currentPlayerIndex >= playerNames.length) {
    currentPlayerIndex = 0;
  }
  if (eventType === 'bits') {
      let dataname = data.trim().toLowerCase();
      let foundGift = commandList.gift ? Object.keys(commandList.gift).find(gift => gift.toLowerCase() === dataname) : null;
      if (foundGift) {
        eventCommands = commandList.gift[foundGift];
      } else {
        eventCommands = commandList.gift['default'];
      }
    } else if (commandList[eventType]) {
      if (typeof commandList[eventType] === 'object' && !Array.isArray(commandList[eventType])) {
        if (data.likes && commandList[eventType][data.likes]) {
          eventCommands = commandList[eventType][data.likes];
        } else {
          eventCommands = commandList[eventType]['default'];
        }
      } else {
        eventCommands = commandList[eventType];
      }
    }
    if (Array.isArray(eventCommands)) {
      eventCommands.forEach(command => {
        let replacedCommand = command
          .replace('{playername}', playerName || '');
          if (eventType === 'bits') {
              setTimeout(() => {
                console.log('comando1', replacedCommand);
                sendReplacedCommand(replacedCommand); // Enviar replacedCommand al servidor
              }, 100); // antes de enviar el comando
            } else if (replacedCommand !== lastCommand) {
              setTimeout(() => {
                lastCommand = replacedCommand;
                console.log('comando2', replacedCommand);
                sendReplacedCommand(replacedCommand); // Enviar replacedCommand al servidor
              }, 100); // antes de enviar el comando
            }
      });
      
  }    
}
function sendReplacedCommand(replacedCommand) {
  fetch('/api/receive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ replacedCommand })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data); // Maneja la respuesta del servidor si es necesario
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
function handleEvent(eventType, tags, message) {
  let playerName = null;
  let eventCommands = [];

  if (playerNames[currentPlayerIndex] === undefined || playerNames[currentPlayerIndex].length < 2) {
    playerName = `${keyplayerName}`;
  } else {
    playerName = playerNames[currentPlayerIndex];
  }

  currentPlayerIndex++;
  if (currentPlayerIndex >= playerNames.length) {
    currentPlayerIndex = 0;
  }

  if (eventType === 'bits') {
    let foundBits = tags.bits;
    if (foundBits) {
      eventCommands = commandList.bits[foundBits];
    } else {
      eventCommands = commandList.bits['default'];
    }
  } else if (commandList[eventType]) {
    if (typeof commandList[eventType] === 'object' && !Array.isArray(commandList[eventType])) {
      if (message && commandList[eventType][message]) {
        eventCommands = commandList[eventType][message];
      } else {
        eventCommands = commandList[eventType]['default'];
      }
    } else {
      eventCommands = commandList[eventType];
    }
  }

  if (Array.isArray(eventCommands)) {
    eventCommands.forEach(command => {
      let replacedCommand = command
        .replace('playername', playerName || '')
        .replace('username', tags.username || '')
        .replace('message', message || '')
        .replace('bits', tags.bits || '')
        .replace('comment', message || '')
        .replace('gift', tags.bits || '')
        .replace('uniqueId', tags.username || '')

      if (eventType !== 'bits' && replacedCommand === lastCommand) {
        return;
      }

      /*if (tags.repeatCount > maxRepeatCount) {
        // Verificar si el comando contiene "tellraw" o "title" y si el contador no es múltiplo de 10
        if ((command.includes("tellraw") || command.includes("title")) && commandCounter % 10 !== 0) {
          return; // No se ejecuta el comando
        }
      }
      commandCounter++;

      let repeatCount = tags.repeatCount || 1; */
      
      if (eventType === 'bits') {
        setTimeout(() => {
          console.log('comando1', replacedCommand);
          sendReplacedCommand(replacedCommand); // Enviar replacedCommand al servidor
        }, 100); // antes de enviar el comando
      } else if (replacedCommand !== lastCommand) {
        setTimeout(() => {
          lastCommand = replacedCommand;
          console.log('comando2', replacedCommand);
          sendReplacedCommand(replacedCommand); // Enviar replacedCommand al servidor
        }, 100); // antes de enviar el comando
      }
      
    });
  }
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
