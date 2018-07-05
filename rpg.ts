/**
 * Beginning of rpg files...
 */

import { PersonInfo } from './main'
import * as Discord from "discord.js";
import { EventEmitter } from 'events';

export interface GameData {
    person: PersonInfo
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
    private registeredListener: EventEmitter
    private awaitingResponse: boolean

    constructor(_person: PersonInfo, channel: sendableChannel, gameData?: string) {
        if(!gameData) {
            this._data = {
                person: _person
            }
        }
        else {
            this._data = JSON.parse(gameData)
        }
        this._channel = channel

        this.initGame().then((val)=> {
            console.log(val)
        })
        this.awaitingResponse = false
        this.initialized = true
        this.registeredListener = new EventEmitter()
    }

    sAExit() {
        return JSON.stringify(this._data)
    }

    private async initGame() {

        this.awaitingResponse = true
        let result = await new Promise(resolve => {
            this.registeredListener.on("complete", ()=> {
                resolve(true)
            })
        })

        return result
    }

    handleMessage(msg: Discord.Message) {
        if(msg.channel!==this._channel) {
            //update channel
            this._channel = msg.channel
        }
        //figure out if msg is in response
        if(this.awaitingResponse) {
            if(msg.content === "complete") {
                this.registeredListener.emit("complete")
            }
        }
        //ignore if not awaiting response
    }

 }