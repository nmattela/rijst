import { monitorFile } from "ags/file";
import { execAsync, subprocess } from "ags/process";
import { interval } from "ags/time";
import GLib from "gi://GLib";
import GObject from "gi://GObject?version=2.0";

const home = GLib.getenv(`HOME`)

export type Disk = {
    filesystem: string,
    ['1k_blocks']: number,
    used: number,
    available: number,
    mounted_on: string,
    use_percent: number,
}

const DiskStat = GObject.registerClass({
    GTypeName: `DiskStat`,
    Properties: {
        disks: GObject.ParamSpec.object(
            `disks`,
            `Disks`,
            `Array of all disks`,
            GObject.ParamFlags.READABLE,
            GObject.Object
        ),
        disk: GObject.ParamSpec.object(
            `disk`,
            `Disk`,
            `The disk on which the filesystem exists`,
            GObject.ParamFlags.READABLE,
            GObject.Object
        ),
    },
    Signals: {
        disks: {}
    }
}, class DiskStat extends GObject.Object {
    static instance: DiskStat;
    static get_default() {
        if(!this.instance) this.instance = new DiskStat()

        return this.instance
    }

    #disks: Array<Disk> = []
    get disks() {
        return this.#disks
    }

    #disk?: Disk
    get disk() {
        return this.#disks.find(disk => disk.mounted_on === `/`)
    }

    constructor() {
        super()

        const fetch = async () => {
            const rawDisks = await execAsync(`${home}/.scripts/disks`)
            const disks = JSON.parse(rawDisks)
            this.#disks = disks
            this.notify(`disks`)
            this.notify(`disk`)
        }

        fetch()
        interval(10 * 60 * 1000, fetch)
    }
})

export default DiskStat