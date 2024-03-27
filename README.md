# Twitch-TTS
speechchat chat de voz y conexion con minecraft
## Requerimientos
-Si utiliza minecraft interactivo usa Aplicacion de escritorio 
-Si solo quiere un speechchat utilize la version web
## Instalación y Configuración Inicial
Crea un bot para interactuar en un servidor
## Minecraft interactivo
Puede configurar el bot para definir su:
- nombre del bot
- Ip del server : puerto
- Su nombre del jugador minecraft
- comando inicial


Aqui le muestro la sintaxis de minecraft :
- Eventos como:
1. chat 
2. gift 
3. follow 
4. share
- Para los comando coloque:
ESTE ES UN EJEMPLO PARA Minecraft TNT 
chat:
  - "/tellraw @a {\"text\":\"{uniqueId} : {comment} \", \"color\":\"green\"}"
  - "/tellraw @a {\"text\":\"{uniqueId} : {message} \", \"color\":\"green\"}"
bits:
  default:
    - "/tellraw @a {\"text\":\"{uniqueId}  sent a {giftName} x{repeatCount} \", \"color\":\"gold\"}"
    - "/title @a subtitle {\"text\":\"ENVIO {giftName} x{repeatCount} \",\"bold\":true,\"color\":\"gold\"}"
    - "/execute at {playername} run summon minecraft:zombie ~ ~ ~ {CustomName:'{\"text\":\"{uniqueId} \"}', CustomNameVisible:1}"
    - "/execute at {playername} run playsound minecraft:entity.player.levelup ambient @p"
    - "/execute at {playername} run give @a minecraft:golden_apple 1"
    - "/title @a title {\"text\":\"{uniqueId} \"}"
   
### Ejemplo
si quiere por cada bit entonces
```

bits:
  1:
   - "/say este es un comando por un bit"
bits:
  10:
   - "/say este es un comando por 10bits"
```
