import * as Discord from "discord.js";
import { Game } from './rpg'

export { Game } from './rpg'

export interface People {
    [id: string]: PersonInfo
}

export interface EmojiUpdate {
    type: "emoji",
    user: string,
    _reaction: Discord.MessageReaction
}

export interface PersonInfo {
    classes: NEUClass[],
    swearNumber: number,
    game: string | undefined,
    playingGame: boolean
}

export interface Games {
    [id: string]: Game | null
}

export interface NEUClass {
    // CS or ...
    type: string,
    classNumber: number,
    section: number
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