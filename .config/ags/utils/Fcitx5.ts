import { monitorFile, readFile } from "ags/file";
import GObject, { property, register } from "ags/gobject";
import { parse } from 'ini/lib/ini.js'
import GLib from "gi://GLib";
import { exec } from "ags/process";
import { interval } from "ags/time";

type LayoutGroup = {
    Name: string,
    "Default Layout": string,
    DefaultIM: string,
    flag: string,
    items: Array<LayoutGroupItem>
}

type LayoutGroupItem = {
    Name: string,
    Layout: string,
}

type LayoutOrder = {
    [index: string]: string
}

const home = GLib.getenv(`HOME`)

const Fcitx5 = GObject.registerClass({
    GTypeName: `Fcitx5`,
    Properties: {
        layouts: GObject.ParamSpec.object(
            `layouts`,
            `Layouts`,
            `Array of all keyboard layouts`,
            GObject.ParamFlags.READABLE,
            GObject.Object,
        ),
        current: GObject.ParamSpec.string(
            `current`,
            `Current`,
            `The current keyboard layout name`,
            GObject.ParamFlags.READWRITE,
            'Default',
        )
    },
    Signals: {
        layouts: {},
        current: {}
    }
}, class Fcitx5 extends GObject.Object {
    static instance: Fcitx5
    static get_default() {
        if(!this.instance) this.instance = new Fcitx5()

        return this.instance
    }

    #layouts: Array<LayoutGroup> = this.getProfile()
    get layouts() {
        return this.#layouts
    }

    #current: string = this.getCurrent()
    get current() {
        return this.#current
    }

    set current(groupName: string) {
        exec([`fcitx5-remote`, `-g`, groupName])
        this.#current = groupName
        this.notify(`current`)
    }

    layoutToFlag(layoutGroup: LayoutGroup) {
        switch(layoutGroup[`Default Layout`]) {
            case `jp`: return `🇯🇵`
            case `cn`: return `🇨🇳`
            case `be`: return `🇧🇪`
            case `us`: return `🇺🇸`
            default: return layoutGroup[`Default Layout`]
        }
    }

    getCurrent() {
        return exec([`fcitx5-remote`, `-q`])
    }

    getProfile() {
        const file = readFile(`${home}/.config/fcitx5/profile`)
        const content: {[x: string]: LayoutGroup | LayoutGroupItem | LayoutOrder} = parse(file)
        
        const groupRegex = /^Groups\/(\d+)$/
        const groupItemRegex = /^Groups\/(\d+)\/Items\/(\d+)$/
        const groupOrderRegex = /^GroupOrder$/

        const groups = Object.entries(content).reduce((acc, [id, value]) => {
            const match = id.match(groupRegex)
            if(match === null) {
                return acc
            }
            const indexString = match[1]
            const index = parseInt(indexString)
            if(isNaN(index)) {
                return acc
            }

            const groupItems = Object.entries(content).reduce((acc, [id, value]) => {
                const match = id.match(groupItemRegex)
                if(match === null) {
                    return acc
                }
                const groupIndexString = match[1]
                const groupIndex = parseInt(groupIndexString)
                if(isNaN(groupIndex)) {
                    return acc
                }
                if(groupIndex !== index) {
                    return acc
                }
                const itemIndexString = match[2]
                const itemIndex = parseInt(itemIndexString)
                if(isNaN(itemIndex)) {
                    return acc
                }

                acc[itemIndex] = value as LayoutGroupItem
                return acc
            }, new Array<LayoutGroupItem>())

            const layoutGroup = value as LayoutGroup
            layoutGroup.items = groupItems

            acc[index] = layoutGroup
            return acc
        }, new Array<LayoutGroup>())

        const groupOrder = Object.entries(content).filter(([id, value]) => id.match(groupOrderRegex) !== null).at(0)

        if(groupOrder !== undefined) {
            const order = Object.entries(groupOrder[1] as LayoutOrder).reduce((acc, [index, name]) => {
                const indexNumber = parseInt(index)
                if(isNaN(indexNumber)) {
                    return acc
                }
                acc[indexNumber] = name
                return acc
            }, new Array<string>())

            groups.sort((a, b) => {
                const aIndex = order.indexOf(a.Name)
                const bIndex = order.indexOf(b.Name)
                return aIndex - bIndex
            })
        }

        return groups
    }

    constructor() {
        super()

        interval(1000, () => {
            const current = exec([`fcitx5-remote`, `-q`])
            if(this.current !== current) {
                this.current = current
            }
        })

        monitorFile(`${home}/.config/fcitx5/profile`, () => {
            const updated = this.getProfile()
            this.#layouts = updated
            this.notify(`layouts`)
        })
    }

})

export default Fcitx5