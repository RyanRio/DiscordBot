/**
 * Beginning of rpg files...
 */

import { PersonInfo, EmojiUpdate } from './main'
import * as Discord from "discord.js";
import { EventEmitter } from 'events';
import {log} from "./logger"

export interface GameData {
    person: PersonInfo,
    pID: string
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

    constructor(ID:string, _person: PersonInfo, channel: sendableChannel, gameData?: string) {
        if(!gameData) {
            log("game being created from default with person: " + JSON.stringify(_person))
            this._data = {
                person: _person,
                pID: ID
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
        this._channel.send("abc").then( msg=> {
            if(msg instanceof Discord.Message) {
                this.emojiList.forEach(val=> {
                    msg.react(val)
                })

                //converting list to list of emoji ids
                this.emojiList = this.emojiList.map((val, index)=> {
                    return msg.reactions.array()[index].emoji.id
                })
            }
        })



        // waiting for user to be done
        this.awaitingResponse = true

        let result = await new Promise(resolve => {
            this.registeredListener.on("complete", ()=> {
                log("heard complete!")
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
                if(this._data.pID === msg.user) {
                    if(this.emojiList.find((val)=> {
                        return msg.emoji.id===val
                    })) {
                        log("found emoji")
                        // found the emoji
                        let reaction = msg.msg.reactions.get(msg.emoji.id)
                        if(reaction) reaction.count = 1
                    }
                }
                else {
                    msg.msg.clearReactions().then((resultMsg)=> {
                        resultMsg.react("<:regional_indicator_f:>")
                    })
                }

            }

        }

    }

 }