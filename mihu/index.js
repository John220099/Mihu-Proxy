const { Relay } = require('bedrock-protocol')
const path = require('path')
const LocalPlayer = require('./entity/localplayer')
const EntityPlayer = require('./entity/entityplayer')
const Commands = require("./commands/toggle");
const Modules = require('./commands/modules');
const AirJump = require('./modules/movement/airjump')
const FullBright = require('./modules/render/fullbright')
const FastBreak = require('./modules/misc/fastbreak')
const Spider = require("./modules/movement/spider")
const Killaura = require("./modules/combat/killaura");
const Antikb = require("./modules/combat/Antikb");
const Jetpack = require("./modules/movement/jetpack");
const Fly = require("./modules/movement/fly");
const Speed = require("./modules/movement/speed");

const hostip = '0.0.0.0'
const hostport = 19132

const port = 19132
const ip = 'play.cubecraft.net'

const relay = new Relay({
    version: '1.26.51',
    host: hostip,
    port: hostport,
    maxPlayers: 1,
    offline: false,
    motd: {
        motd: 'mihu proxy',
        levelName: ip,
    },
    destination: {
        host: ip,
        port: port,
        offline: false,
    },
    profilesFolder: path.join(__dirname, './../tokens')
})

relay.listen()
console.log("Starting proxy...")
relay.conLog = console.debug

relay.on('connect', player => {
    player.setMaxListeners(20);

    const originalClose = player.close.bind(player)
    const originalDestroy = player.destroy?.bind(player)

    //data
    const localPlayer = new LocalPlayer(player)
    const entityplayer = new EntityPlayer(player)

    //commands
    const commands = new Commands(player)
    const modules = new Modules(player)

    //modules
    const airJump = new AirJump(player, localPlayer)
    const fullbright = new FullBright(player, localPlayer)
    const fastbreak = new FastBreak(player, localPlayer)
    const spider = new Spider(player, localPlayer)
    const killaura = new Killaura(player, localPlayer, entityplayer)
    const antikb = new Antikb(player)
    const jetpack = new Jetpack(player, localPlayer)
    const speed = new Speed(player, localPlayer)
    const fly = new Fly(player, localPlayer)

    player.on('clientbound', ({name, params}, des) => {
        if (name === 'text') {
            params.message += `, on ${new Date().toLocaleString()}`
        }

        if (name === 'disconnect' || name === 'serverbound_data_driven_screen_closed') {
            des.canceled = true
        }

        if (name === 'transfer') {
            params.server_address = hostip
            params.port = hostport
            params.reload_world = false
        }
    })

    player.on('serverbound', ({name, params}) => {
        if (name === 'player_auth_input') {
            player.queue('text', {
                type: 'tip',
                needs_translation: false,
                source_name: '',
                xuid: '',
                platform_chat_id: '',
                filtered_message: '',
                message: '§l§k..§r§l§5MIHU PROXY§r§l§k..'
            })
        }
    })
})