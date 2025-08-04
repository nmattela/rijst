import { exec } from "ags/process";
import GLib from "gi://GLib";
import GObject from "gi://GObject?version=2.0";

const home = GLib.getenv(`HOME`)

const UserDetails = GObject.registerClass({
    GTypeName: `UserDetails`,
    Properties: {
        fullname: GObject.ParamSpec.string(
            `fullname`,
            `Full Name`,
            `The full name of the user`,
            GObject.ParamFlags.READABLE,
            ``
        ),
        image: GObject.ParamSpec.string(
            `image`,
            `Image`,
            `The file path to the user's profile picture`,
            GObject.ParamFlags.READABLE,
            ``
        )
    },
    Signals: {
        fullname: {},
        image: {}
    }
}, class UserDetails extends GObject.Object {
    static instance: UserDetails;
    static get_default() {
        if(!this.instance) this.instance = new UserDetails()

        return this.instance
    }

    get fullname() {
        return exec(`${home}/.scripts/fullname`)
    }

    get image() {
        try {
            exec(`stat ${home}/.face`)
            return `${home}/.face`
        } catch(e) {
            return undefined
        }
    }
})

export default UserDetails