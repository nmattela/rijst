import { monitorFile } from "ags/file";
import { exec, execAsync } from "ags/process";
import GLib from "gi://GLib";
import GObject from "gi://GObject?version=2.0";

const home = GLib.getenv(`HOME`)

export type MemInfo = {
    MemTotal: number,
    MemFree: number,
    MemAvailable: number,
}

export type Stat = {
    cpu: {
        user: number,
        nice: number,
        system: number,
        idle: number,
        iowait: number,
        irq: number,
        softirq: number,
        steal: number,
        guest: number,
        guest_nice: number,
    }
}

const Proc = GObject.registerClass({
    GTypeName: `Metrics`,
    Properties: {
        meminfo: GObject.ParamSpec.object(
            `meminfo`,
            `Info`,
            `All Memory Information`,
            GObject.ParamFlags.READABLE,
            GObject.Object,
        ),
        stat: GObject.ParamSpec.object(
            `stat`,
            `Stat`,
            `Stat file`,
            GObject.ParamFlags.READABLE,
            GObject.Object,
        ),
    },
    Signals: {
        meminfo: {},
        stat: {}
    }
}, class Proc extends GObject.Object {
    static instance: Proc;
    static get_default() {
        if (!this.instance) this.instance = new Proc();

        return this.instance;
    }

    #meminfo: MemInfo = JSON.parse(exec(`${home}/.scripts/meminfo`))

    get meminfo() {
        return this.#meminfo
    }

    #stat: Stat = JSON.parse(exec(`${home}/.scripts/stat`))

    get stat() {
        return this.#stat
    }

    cpu() {
        const { guest, guest_nice, idle, iowait, irq, nice, softirq, steal, system, user } = this.stat.cpu
        const total = guest + guest_nice + idle + iowait + irq + nice + softirq + steal + system + user
        return idle / total
    }

    constructor() {
        super()

        monitorFile(`/proc/meminfo`, async (f) => {
            const response = await execAsync(`${home}/.scripts/meminfo`)
            const responseJson: MemInfo = JSON.parse(response)
            this.#meminfo = responseJson
            this.notify(`meminfo`)
        })

        monitorFile(`/proc/stat`, async () => {
            const response = await execAsync(`${home}/.scripts/stat`)
            const responseJson: Stat = JSON.parse(response)
            this.#stat = responseJson
            this.notify(`stat`)
        })
    }
})

export default Proc