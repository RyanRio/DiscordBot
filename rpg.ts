/**
 * Beginning of rpg files...
 */

import { PersonInfo, EmojiUpdate, log } from './main'
import * as Discord from "discord.js";
import { EventEmitter } from 'events';

export interface GameData {
    // among other things, stores a serialized version of the game in this property
    person: PersonInfo,
    pID: string,
    stats: GameStat
}

export interface GameStat {
    [statName: string]: number
}

type sendableChannel = Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel
/**
 * Personal to a single person, destroy instance as needed
 * 
 * 
 */
export class Game {

    public _data: GameData
    public _channel: sendableChannel
    private initialized: boolean
    public registeredListener: EventEmitter
    private awaitingResponse: boolean
    private cMSGID: string = ""
    private emojiList: string[]=[]
    //last message sent
    private lms: Discord.Message | undefined | Discord.Message[]= undefined

    constructor(ID:string, _person: PersonInfo, channel: sendableChannel, gameData?: string) {
        if(!gameData) {
            log("game being created from default with person: " + JSON.stringify(_person))
            this._data = {
                person: _person,
                pID: ID,
                stats: {}
            }
        }
        else {
            log("game being created from inputted data")
            this._data = JSON.parse(gameData)
        }
        this._channel = channel
        this.registeredListener = new EventEmitter()
        this.awaitingResponse = true
        this.initialized = false
        this.initGame().then((val)=> {
            log(val)
            this.awaitingResponse = false
            this.initialized = true
        })


    }

    sAExit() {
        log("saving with data: " + JSON.stringify(this._data))
        return JSON.stringify(this._data)
    }

    private async initGame() {
        //sending stat builder here
        this.emojiList = ["🇫"]

        interface map {
            [name: string]: string
        }
        let mapping:map = {
            ["🇫"]: "Fear"
        }

        let embed = {
            embed: {
                color: 3447003,
                title: "Stat Builder",
                description: "Set your stats for your definitely not dark souls playthrough",
                fields: 
                [
                    {
                        name: "Strength",
                        value: "0"
                    },
                    {
                        name: "Dexterity",
                        value: "0"
                    },
                    {
                        name: "Vigor",
                        value: "0"
                    },
                    {
                        name: "Fear",
                        value: "0"
                    }
                ],
                timestamp: new Date(),
            }
        }

        this._channel.send(embed).then( msg=> {
            this.lms = msg
            if(msg instanceof Discord.Message) {
                this.emojiList.forEach(val=> {
                    msg.react(val).catch(err=> {
                        log("reaction failed because of: " + JSON.stringify(err))
                    })
                })

                this.registeredListener.on("emojiIncrease", (emoji: Discord.Emoji | Discord.ReactionEmoji)=> {
                    if(this.lms) {
                        if(this.lms instanceof Discord.Message) {

                            let name = mapping[emoji.name]
                            let fField = embed.embed.fields.find(field=> {
                                return field.name===name
                            })
                            if(fField) {
                                fField.value = (parseInt(fField.value) + 1).toString()
                                this._data.stats[fField.name] = parseInt(fField.value)
                            } 
                            this.lms.edit(embed).then(uMsg=> {
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
            this.registeredListener.on("complete", ()=> {
                log("heard complete!")

                // put stats into game data before resolving... TODO

                resolve(true)
            })
        }).catch((reason)=> {
            log(reason)
        })


        return result
    }

    handleMessage(msg: Discord.Message | EmojiUpdate) {
        if(msg instanceof Discord.Message) {
            if(msg.channel !== this._channel) {
                //update channel
                this._channel = msg.channel
            }
    
            log("content: " + msg.content + " awaiting response: " + this.awaitingResponse)
            //figure out if msg is in response
            if(this.awaitingResponse) {
    
                if(msg.content === "complete") {
                    log("emitting complete")
                    this.registeredListener.emit("complete")
                }
            }
            //ignore if not awaiting response
        }
        else {
            // only notice the emoji update if the user is the same
            if(this.awaitingResponse) {
                log("received emoji with id: " + msg._reaction.emoji.name)
                if(this._data.pID === msg.user) {
                    if(this.emojiList.find((val)=> {
                        return msg._reaction.emoji.name===val
                    })) {
                        log("found emoji")
                        // found the emoji
                        msg._reaction.remove(msg.user).then(()=> {
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
                    msg._reaction.message.clearReactions().then((resultMsg)=> {
                        resultMsg.react("<:regional_indicator_f:>")
                    })
                }

            }

        }

    }

 }