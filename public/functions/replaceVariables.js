
const replaceVariables = (command, data, likes) => {
  let playerName = localStorage.getItem('playerName');
  if (!command){
    return command;
  }
    console.log(command);
    // Reemplazar variables en el comando (unchanged)
    let replacedCommand = command
        .replace(/uniqueId/g, tags.username || 'testUser')
        .replace(/uniqueid/g, tags.username || 'testUser')
        .replace(/nickname/g, tags.username || 'testUser')
        .replace(/comment/g, message || 'testComment')
        .replace(/{milestoneLikes}/g, likes || '50testLikes')
        .replace(/{likes}/g, likes || '50testLikes')
        .replace(/message/g, message || 'testcomment')
        .replace(/giftName/g, tags.bits || 'testgiftName')
        .replace(/giftname/g, tags.bits || 'testgiftName')
        .replace(/bits/g, tags.bits || '123')
        .replace(/repeatCount/g, data.repeatCount || '123')
        .replace(/repeatcount/g, data.repeatCount || '123')
        .replace(/playername/g, playerName || '@a');
  
    // Remove all backslashes (proceed with caution!)
    replacedCommand = replacedCommand.replace(/\\/g, '');
    console.log(playerName);
    //console.log(replacedCommand);
    return replacedCommand;
  };
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
const escapeMinecraftCommand = (command) => {
// Escape only double quotes, not backslashes (unchanged)
return command.replace(/"/g, '\\"');
};
export { replaceVariables };