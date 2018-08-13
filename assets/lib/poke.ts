/**
 * Beginning of poke files...
 */

import { EmojiUpdate, GameData, Command, EventFunc, StatRoller, Timer } from './poke-types'
import * as Discord from "discord.js";
import { EventEmitter } from 'events';
import { PersonInfo } from './main-lib'
import { logger } from './logger'
import * as glob from "glob"
import * as fs from 'fs';

type sendableChannel = Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel
/**
 * Personal to a single person, destroy instance as needed
 */
export class Game {

    /**
     * For stopping the yank timer
     */
    private caughtFish: boolean = false
    private pokeLost: boolean = false
    private distCatch: number = 0
    // how the pokemons and users base stats can scale, low medium and high
    private baseSScale: {
        l: StatRoller,
        m: StatRoller,
        h: StatRoller
    }

    // scales for mp and hp (mp for people, hp for pokemon)
    private pSScale: {
        mp: StatRoller,
        hp: StatRoller
    }
    private EventFuncs: EventFunc = {}
    private commands: Command = {}
    public _data: GameData
    public _channel: sendableChannel
    private initialized: boolean
    public registeredListener: EventEmitter
    private awaitingResponse: boolean
    private cMSGID: string = ""
    private emojiList: string[] = []
    //last message sent
    private lms: Discord.Message | undefined | Discord.Message[] = undefined

    constructor(ID: string, _person: PersonInfo, channel: sendableChannel, gameData?: string) {

        this.baseSScale = {
            l: new StatRoller(1, 2, 0), //min 1 max 2 avg 1.5
            m: new StatRoller(1, 3, 0), //min 1 max 3 avg 2
            h: new StatRoller(3, 2, 0) // min 3 max 6 avg 4.5
        }

        this.pSScale = {
            mp: new StatRoller(2, 25, 100), //min 102 max 150 avg 126.5
            hp: new StatRoller(4, 40, 100) //min 104 max 260 avg 180
        }

        if (!gameData) {
            logger.log("game being created from default with person: " + JSON.stringify(_person))
            this._data = {
                person: _person,
                pID: ID,
                stats: {},
                pokemon: []
            }
        }
        else {
            logger.log("game being created from inputted data")
            this._data = JSON.parse(gameData)
        }
        this._channel = channel
        this.registeredListener = new EventEmitter()
        this.awaitingResponse = true
        this.initialized = false
        // rename beginGame neccesary?
        this.initGame().then((val) => {
            logger.log(val)
            this.awaitingResponse = false
            this.beginGame().then(res => {
                //beginGame succeeds
                if (res) {
                    if (this._data.stats["Luck"] === 15) {
                        //tadpole game
                        this.registeredListener.emit("cPoke", "000")
                    }
                    else if (this._data.stats["Power"] === 5 && this._data.stats["Luck"] === 5 && this._data.stats["Speed"] === 5) {
                        //perfectly balanced, as all things should be
                        this.registeredListener.emit("cPoke", "320-s")
                    }
                    else {
                        // starters... events are all handled in beginGame so process can essentially end here
                    }
                }
            })
        })


    }

    /**
     * initialized is true at end of function
     * sets up all events now that the player has started a game
     */
    async beginGame() {

        // pokemon on the hook... can be caught with reel command

        let pokeOL = false
        let yankR = false
        /**
         * while ingame these keys can be pressed rather than having to type a full command
         * f - cast / begin fishing
         * r - reel
         * e - yank line
         * t - train pokemon
         */

        // manually assign... commands are one letter keys that point to a string to emit an event
        // eventFuncs are strings that refer to a one letter key which refer to a function

        //could put each of these functions just inside the listener however neater like this
        this.EventFuncs["cast"] = () => {
            this.pokeLost = false
            this.distCatch = 5
            this.caughtFish = false

            let oT = new Timer(Math.floor(Math.random() * 6 + 1)).time().then(()=>
            {
                this._channel.send("A pokemon is on the line")
                pokeOL = true
                let lT = new Timer(2).time().then(() => {
                    // if its still on the line then it gets away
                    if (pokeOL) {
                        this._channel.send("It got away!")
                        this.pokeLost = true
                    }
                })
            })
        }

        this.EventFuncs["reel"] = () => {
            if (pokeOL) {
                this.beginReel()
                this._channel.send("Great job! You've still got it")
                pokeOL = false
            }

        }

        this.EventFuncs["yankR"] = () => {
            yankR = true
            this._channel.send("The pokemon is getting away!")
            let lT = new Timer(3).time().then(() => {
                // if its still on the line then it gets away
                if (yankR) {
                    this._channel.send("It got away!")
                    this.pokeLost = true
                }
            })

        }
        this.EventFuncs["yank"] = () => {
            logger.log("yank heard!")
            if(yankR) {
                yankR = false
                if(this.distCatch>0) {
                    this.distCatch -= 2
                    this._channel.send("Great job! You've still got it!")
                }
                else {
                    yankR = false
                    this.registeredListener.emit("cPoke", Math.floor(Math.random()*600 + 100).toString())
                }

            }
        }

        this.EventFuncs["train"] = () => {

        }

        /**
         * pokemonID - 3 digit number
         */
        this.EventFuncs["cPoke"] = (pokemonID: string) => {
            this.caughtFish = true
            //shinys have id format 'normalid-s'
            //tadpole is 000
            glob(`./assets/img/${pokemonID}*`, (err, matches) => {
                logger.log("glob error: " + JSON.stringify(err))
                fs.readFile(matches[0], (errFile, data) => {
                    this._channel.send({
                        file: data
                    })
                    if(errFile) {
                        logger.log("read file error: " + errFile.message)
                    }

                })
            })

            // determine stats, between 1 and 10

            this._data.pokemon.push({
                id: parseInt(pokemonID),
                stats: {
                    health: 10,
                    strength: 10,
                    speed: 10
                },
                shiny: false
            })
            this.distCatch = 0
        }

        this.commands["f"] = "cast"
        this.commands["r"] = "reel"
        this.commands["e"] = "yank"
        this.commands["t"] = "train"

        this.registeredListener.on("cast", this.EventFuncs["cast"])
        this.registeredListener.on("reel", this.EventFuncs["reel"])
        this.registeredListener.on("yank", this.EventFuncs["yank"])
        this.registeredListener.on("train", this.EventFuncs["train"])
        this.registeredListener.on("cPoke", this.EventFuncs["cPoke"])
        this.registeredListener.on("yankR", this.EventFuncs["yankR"])

        // switch initialized and awaiting response flag to alert handlemessage that it can now emit
        this.awaitingResponse = true
        this.initialized = true

        return true
    }

    private async beginReel() {

        //begin loop of yanking and reeling
        let t = new Timer(5)

        this.castTimerLooping(t, () => {
            t.retime(Math.floor(Math.random() * 6 + 3))
            this.registeredListener.emit("yankR")
        })

    }

    /**
     * ONLY call in an async function
     * @param t timer to run
     * @param cb perform a function after the timer runs
     */
    private castTimerLooping(t: Timer, cb: () => void) {
        t.time().then(
            () => {
                if (!this.caughtFish && !this.pokeLost) {
                    cb()
                    this.castTimerLooping(t, cb)
                }
            }
        )
    }

    sAExit() {
        logger.log("saving with data: " + JSON.stringify(this._data))
        this.registeredListener.removeAllListeners()
        delete this.registeredListener
        return JSON.stringify(this._data)
    }

    private async initGame() {
        //sending stat builder here
        this.emojiList = ["🇸", "🇱", "🇷", "🇵"]

        interface map {
            [name: string]: string
        }
        let mapping: map = {
            ["🇵"]: "Power",
            ["🇸"]: "Speed",
            ["🇱"]: "Luck",
            ["🇷"]: "Redo"
        }

        let embed = {
            embed: {
                color: 3447003,
                title: "Game Introduction",
                description: "Set your stats and read the instructions!",
                fields:
                    [
                        {
                            name: "Warning!",
                            value: "You can't decrease stats once you have put a point in, if you mess up click on the 🇷 reaction"
                        },
                        {
                            name: "Luck - Do you feel like every game is rigged against you? Then up this stat and notice a dramatic increase in your luck... react with 🇱 to increase",
                            value: "0"
                        },
                        {
                            name: "Speed - Are you not a god-tier keyboard gamer like Saul? Then this stat will compensate for your crappy reaction time... react with 🇸 to increase",
                            value: "0"
                        },
                        {
                            name: "Power - Pretty self-explanatory, are you strong enough to pull up the pokemon or are you not... don't worry about being weak too much though, every pokemon can be caught at any level... react with 🇵 to increase",
                            value: "0"
                        }

                    ],
                timestamp: new Date(),
            }
        }

        this._channel.send(embed).then(msg => {
            this.lms = msg
            if (msg instanceof Discord.Message) {
                this.emojiList.forEach(val => {
                    msg.react(val).catch(err => {
                        logger.log("reaction failed because of: " + JSON.stringify(err))
                    })
                })

                this.registeredListener.on("emojiIncrease", (emoji: Discord.Emoji | Discord.ReactionEmoji) => {
                    if (this.lms) {
                        if (this.lms instanceof Discord.Message) {

                            let name = mapping[emoji.name]
                            let fField = embed.embed.fields.find(field => {
                                return field.name.split(" ")[0] === name
                            })
                            if (fField) {
                                fField.value = (parseInt(fField.value) + 1).toString()
                                this._data.stats[fField.name] = parseInt(fField.value)
                            }
                            else if (name === "Redo") {
                                //reset all stats
                                embed.embed.fields.forEach((field, index) => {
                                    // get rid of this number later... used for ignoring first field
                                    if (index > 0) {
                                        field.value = "0"
                                    }
                                })
                            }
                            this.lms.edit(embed).then(uMsg => {
                                this.lms = uMsg
                            })
                        }
                    }
                })
            }
        })



        // waiting for user to be done
        this.awaitingResponse = true

        let result = await new Promise(resolve => {
            this.registeredListener.on("complete", () => {
                logger.log("heard complete!")

                // put stats into game data before resolving... TODO

                resolve(true)
            })
        }).catch((reason) => {
            logger.log(reason)
        })


        return result
    }

    handleMessage(msg: Discord.Message | EmojiUpdate) {
        // also need to check if it is just one digit, in which case it is a command
        if (msg instanceof Discord.Message) {
            if (msg.channel !== this._channel) {
                //update channel
                this._channel = msg.channel
            }

            logger.log("content: " + msg.content + " awaiting response: " + this.awaitingResponse)
            //figure out if msg is in response
            if (this.awaitingResponse) {

                if (this.initialized) {
                    if (msg.content.length === 1) {
                        logger.log("emitting event: " + this.commands[msg.content])
                        this.registeredListener.emit(this.commands[msg.content])
                    }
                }
                if (msg.content === "complete") {
                    logger.log("emitting complete")
                    this.registeredListener.emit("complete")
                }
            }
            //ignore if not awaiting response
        }
        else {
            // only notice the emoji update if the user is the same
            if (this.awaitingResponse) {
                logger.log("received emoji with id: " + msg._reaction.emoji.name)
                if (this._data.pID === msg.user) {
                    if (this.emojiList.find((val) => {
                        return msg._reaction.emoji.name === val
                    })) {
                        logger.log("found emoji")
                        // found the emoji
                        msg._reaction.remove(msg.user).then(() => {
                            this.registeredListener.emit("emojiIncrease", msg._reaction.emoji)
                        })

                        /*
                        let reactionArray = msg.msg.reactions.array()

  
                        reactionArray.forEach(val=> {
                            val.fetchUsers().then(user=> {
                                let users = user.array()
                                users.forEach(usr=> {
                                    if(usr.bot===false) {
                                        val.remove(usr)
                                    }
                                })
                            })
                        })
                        */
                    }
                }
                else {
                    msg._reaction.message.clearReactions().then((resultMsg) => {
                        resultMsg.react("<:regional_indicator_f:>")
                    })
                }

            }

        }

    }

}