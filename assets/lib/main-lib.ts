import * as Discord from "discord.js";
import { logger } from './logger'

export interface People {
    [id: string]: PersonInfo
}

export interface NEUClass {
    // CS or ...
    type: string,
    classNumber: number,
    section: number
}

export interface PersonInfo {
    classes: NEUClass[],
    swearNumber: number,
    game: string | undefined,
    playingGame: boolean
}

export class Lib {

    people: People = {

    }
    /**
     * returns reference to the class in this.people
     * @param initialClass 
     * @param author 
     */
    lookForReference(initialClass: NEUClass, author: Discord.User): NEUClass | undefined {
        let asdfClass: NEUClass | undefined
        let me = this.people[author.id]
        if (me) {
            asdfClass = me.classes.find(sClass => {
                if (sClass.classNumber === initialClass.classNumber) {
                    if (sClass.section === initialClass.section) {
                        if (sClass.type === initialClass.type) {
                            // found it... these 2 extra if statements may be unnecesary, but I don't know if there are duplicate classnumbers or etc.
                            return true
                        }
                    }
                }
                return false
            })
        }
        return asdfClass
    }
    buildFromParse(classList: string, author: Discord.User) {
        let authorID = author.id; //use this to fetch

        // begin parsing... classes need to be of format (*area of study**number* *section*,)**
        let splitClassList = classList.split(",");
        if (splitClassList[1][0] == " ") {
            splitClassList = classList.split(", ")
        }
        logger.log(`class list: ${splitClassList}`)
        for (let sClass of splitClassList) {
            let siClass = sClass.split(" ");
            let newClass: NEUClass = {
                type: "",
                classNumber: 0,
                section: 0
            }
            newClass.section = parseInt(siClass[1]);
            let index: number = 0;
            while (index < siClass[0].length) {
                let siClassChar = siClass[0][index]
                logger.log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar)
                let charInt: number = parseInt(siClassChar)

                if (!isNaN(charInt)) {
                    logger.log("stopping on int: " + charInt)
                    let classNumber = siClass[0].substring(index)
                    newClass.classNumber = parseInt(classNumber)
                    newClass.type = siClass[0].substring(0, index)
                    break
                }
                index++
            }
            logger.log("adding class")
            this.people[author.id].classes.push(newClass)
        }
    }

    /**
     * function for modifying a class later on
     * @param classList 
     */
    parse(classList: string) {
        let siClass = classList.split(" ");
        let newClass: NEUClass = {
            type: "",
            classNumber: 0,
            section: 0
        }
        newClass.section = parseInt(siClass[1]);
        let index: number = 0;
        while (index < siClass[0].length) {
            let siClassChar = siClass[0][index]
            logger.log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar)
            let charInt: number = parseInt(siClassChar)

            if (!isNaN(charInt)) {
                logger.log("stopping on int: " + charInt)
                let classNumber = siClass[0].substring(index)
                newClass.classNumber = parseInt(classNumber)
                newClass.type = siClass[0].substring(0, index)
                break
            }
            index++
        }

        return newClass
    }

    checkIfExists(authorID: string): PersonInfo | undefined {
        if (this.people[authorID] !== undefined) {
            return this.people[authorID]
        }
        return undefined;
    }

    cDisplayCB(input: NEUClass) {
        return `${input.type}${input.classNumber.toString()} ${input.section}`
    }
    /**
     * returns two string arrays, index 0 are names, index 1 are content
     * @param fields parses fields as a list of strings in order of name, content, name, ...
     * @param fvalfn function to call on each field value to make more appealing to the users eye
     */
    embedMsg<T>(fields: T[], title: string, description: string, fvalfn?: ((input: any) => string), tick?: string) {
        let odds: string[] = []
        console.log(fields)
        let embed = {
            embed: {
                color: 3447003,
                title: title,
                description: description,
                fields: [] as {}[],
                timestamp: new Date(),
            }
        }

        if (!tick) {
            fields.forEach((val, index, array) => {
                if (index % 2 === 0) {
                    embed.embed.fields.push({ name: val, value: array[index + 1] })
                }
            })
        }
        else {
            if(fvalfn)
            fields.forEach((val, index, array) => {
                embed.embed.fields.push({ name: `${tick} ${index + 1}`, value: fvalfn(val) })
            })
        }

        return embed
    }
}