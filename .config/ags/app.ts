import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import SystemMenu from "./widget/SystemMenu"
import GLib from "gi://GLib"
import PushNotification from "./widget/PushNotification"
import { Power } from "./widget/Power"

app.start({
    css: style,
    icons: `${GLib.getenv(`HOME`)}/.config/ags/icons`,
    main() {
        app.get_monitors().map(Bar)
        app.get_monitors().map(SystemMenu)
        app.get_monitors().map(PushNotification)
        app.get_monitors().map(Power)
    },
})
