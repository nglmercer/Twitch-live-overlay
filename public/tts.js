export class TTS {
  constructor(message, tags) {
    this.speak(message, tags, this.speechType(), this.announceFlag());
    this.write(message, tags); 
  }

  speechType() {
    // if (!document.getElementById('hqspeech').checked) {
    //   return 'browser';
    // }
    return 'browser';
  }

  announceFlag() {
    return document.getElementById('announcechatter').checked;
  }

  speak(message, tags, type, announceflag) {
    if (type === 'browser') {
      if (announceflag) {
        var chatter = tags['display-name']; 
        message = `${chatter} dice ${message}`;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = document.querySelector('#volume').value;

      const voices = speechSynthesis.getVoices();
      let voiceSelect = document.getElementById('voiceSelect');
      let selectedVoice = voices.find(voice => voice.name === voiceSelect.selectedOptions[0].getAttribute("data-name"));

      if (document.getElementById('randomVoice').checked) {
        selectedVoice = setRandomVoice(voices);
      }

      let speed = document.getElementById('randomSpeedValue').value;
      if (document.getElementById('randomSpeed').checked) {
        speed = setRandomSpeed();
      }

      let pitch = document.getElementById('randomPitchValue').value;
      if (document.getElementById('randomPitch').checked) {
        pitch = setRandomPitch();
      }

      utterance.voice = selectedVoice;
      utterance.rate = parseFloat(speed);
      utterance.pitch = parseFloat(pitch);
      console.log(utterance.voice, utterance.rate, utterance.pitch);

      window.speechSynthesis.speak(utterance);
      document.getElementById("audiotrack").pause();
      document.getElementById("audiotrack").currentTime = 0;
    }
  }

  write(message, tags) {
    let div = document.createElement('div'); 
    div.className = "single-message";

    let chatter = document.createElement('span'); 
    chatter.className = "chatter";
    chatter.style.color = tags['color'];
    chatter.textContent = `${tags['display-name']}: `;

    let chatMessage = document.createElement('span'); 
    chatMessage.className = "messageContent"; 
    chatMessage.textContent = message; 

    div.appendChild(chatter); 
    div.appendChild(chatMessage); 

    document.getElementById("messages").appendChild(div); 
  }
}
function setRandomVoice(voices) {
  const randomIndex = Math.floor(Math.random() * voices.length);
  return voices[randomIndex];
}

function setRandomSpeed() {
  return (Math.random() * (1.5 - 0.5) + 0.5).toFixed(1);
}

function setRandomPitch() {
  return (Math.random() * (1.5 - 0.5) + 0.5).toFixed(1);
}
