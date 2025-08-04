import { execAsync } from "ags/process"
import GLib from "gi://GLib?version=2.0"

export function pad<T>(array: Array<T>, size: number): Array<T | undefined> {
    const currLength = array.length
    const missing = size - currLength
    if(missing === 0) {
        return array
    } else if(missing > 0) {
        const pad = Array.from(new Array(missing)).map(() => undefined)
        return [...array, ...pad]
    } else {
        return array.slice(0, size)
    }
}

export async function playSound(soundName: 'startup') {
    execAsync(`cvlc --no-repeat --play-and-exit ${GLib.getenv(`HOME`)}/.config/ags/sounds/${soundName}.mp3`)
}