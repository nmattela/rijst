import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import SystemMenu from "./widget/SystemMenu"
import GLib from "gi://GLib"
import PushNotification from "./widget/PushNotification"
import { Power } from "./widget/Power"
import AppLauncher from "./widget/AppLauncher"
import Desktop from "./widget/Desktop"
import { playSound } from "./utils/utils"

app.start({
    css: style,
    icons: `${GLib.getenv(`HOME`)}/.config/ags/icons`,
    main() {

        const monitor = app.get_monitors().find(m => m.connector === `DP-3`)

        if(monitor !== undefined) {
            Bar(monitor)
            SystemMenu(monitor)
            PushNotification(monitor)
            Power(monitor)
            AppLauncher(monitor)
            Desktop(monitor)
        }

        // app.get_monitors().map(Bar)
        // app.get_monitors().map(SystemMenu)
        // app.get_monitors().map(PushNotification)
        // app.get_monitors().map(Power)
        // app.get_monitors().map(AppLauncher)
    },
})
