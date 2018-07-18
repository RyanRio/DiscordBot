/**
 * Beginning of rpg files...
 */

import { PersonInfo, EmojiUpdate, GameData, Command, EventFunc } from './rpg-types'
import * as Discord from "discord.js";
import { EventEmitter } from 'events';
import { logger } from './logger'
import * as glob from "glob"
import * as fs from 'fs';

type sendableChannel = Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel
/**
 * Personal to a single person, destroy instance as needed
 */
export class Game {

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
        this.initGame().then((val) => {
            logger.log(val)
            this.awaitingResponse = false
            this.beginGame().then(res=> {
                //beginGame succeeds
                if(res) {
                    if(this._data.stats["Luck"]===15) {
                        //tadpole game
                        this.registeredListener.emit("cPoke", "000")
                    }
                    else if(this._data.stats["Power"]===5 &&this._data.stats["Luck"]===5 &&this._data.stats["Speed"]===5) {
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

        /**
         * while ingame these keys can be pressed rather than having to type a full command
         * f - cast / begin fishing
         * r - reel
         * q - speed up
         * w - slow down
         * e - yank line
         * t - train pokemon
         */

        // manually assign... commands are one letter keys that point to a string to emit an event
        // eventFuncs are strings that refer to a one letter key which refer to a function
        
        //could put each of these functions just inside the listener however neater like this
        this.EventFuncs["cast"] = () => {
            this.beginCast()
        }

        this.EventFuncs["reel"] = () => {

        }

        this.EventFuncs["sUp"] = () => {

        }

        this.EventFuncs["sDown"] = () => {

        }

        this.EventFuncs["yank"] = () => {

        }

        this.EventFuncs["train"] = () => {

        }

        /**
         * pokemonID - 3 digit number
         */
        this.EventFuncs["cPoke"] = (pokemonID: string) => {
            //shinys have id format 'normalid-s'
            //tadpole is 000
            glob(`./assets/img/${pokemonID}*`, (err, matches)=> {
                logger.log("glob error: " + JSON.stringify(err))
                fs.readFile(matches[0], (errFile, data)=> {
                    this._channel.send({
                        file: data
                    })
                    logger.log("read file error: " + errFile.message)
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
        }

        this.commands["f"] = "cast"
        this.commands["r"] = "reel"
        this.commands["q"] = "sUp"
        this.commands["w"] = "sDown"
        this.commands["e"] = "yank"
        this.commands["t"] = "train"


        this.registeredListener.on("cast", this.EventFuncs["cast"])
        this.registeredListener.on("reel", this.EventFuncs["reel"])
        this.registeredListener.on("sUp", this.EventFuncs["sUp"])
        this.registeredListener.on("sDown", this.EventFuncs["sDown"])
        this.registeredListener.on("yank", this.EventFuncs["yank"])
        this.registeredListener.on("train", this.EventFuncs["train"])
        this.registeredListener.on("cPoke", this.EventFuncs["cPoke"])

        // switch initialized and awaiting response flag to alert handlemessage that it can now emit
        this.awaitingResponse = true
        this.initialized = true

        return true
    }

    private async beginCast() {
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
                            else if(name==="Redo") {
                                //reset all stats
                                embed.embed.fields.forEach((field, index)=> {
                                    // get rid of this number later... used for ignoring first field
                                    if(index>0) {
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

                if(this.initialized) {
                    if(msg.content.length===1) {
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