import * as Discord from "discord.js";
import { Game } from './poke'
import { PersonInfo} from './main-lib'
export { Game } from './poke'

export class Timer {

    private initT: number = 0
    private timeForAction: number

    /**
     * 
     * @param timeForAction time in seconds when the timer should finish
     */
    constructor(timeForAction: number) {
        this.timeForAction = timeForAction
    }

    async time() {
        let t = new Date()
        this.initT = t.getSeconds()

        let val = await new Promise<void>((res, rej)=> {
            setTimeout(() => {
                res()
            },this.timeForAction * 1000)
        })

        return

    }

    /**
     * 
     * @param t time in seconds
     */
    retime(t: number) {
        this.timeForAction = t
    }

    timeLeft() {
        let c = new Date().getSeconds()
        return (this.timeForAction - (c - this.initT))
    }


}

export class StatRoller {
    numDies: number
    numSides: number
    modifier: number
    constructor(numDies: number, numSides: number, modifier=0) {
        this.modifier = modifier
        this.numDies = numDies
        this.numSides = numSides
    }

    Roll(): number {
        //returns number between 1 and numSides
        let result = 0
        for(let i=0; i < this.numDies; i++) {
            result += Math.floor((Math.random()*this.numSides)+1)
        }

        return result + this.modifier
    }
}

export interface EmojiUpdate {
    type: "emoji",
    user: string,
    _reaction: Discord.MessageReaction
}

export interface Games {
    [id: string]: Game | null
}

export interface GameData {
    // among other things, stores a serialized version of the game in this property
    person: PersonInfo,
    pID: string,
    stats: GameStat,
    pokemon: Pokemon[]
}

export interface Pokemon {
    id: number,
    stats: {
        health: number,
        speed: number,
        strength: number
    },
    shiny: boolean
}

export interface GameStat {
    [statName: string]: number
}


// key mapped to an event name to call
export interface Command {
    [key: string]: string
}

export interface EventFunc {
    [key: string]: (data?: any)=> void
}