import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import SystemMenu from "./widget/SystemMenu"

app.start({
    css: style,
    icons: `/home/nmattela/.config/ags/icons`,
    main() {
        app.get_monitors().map(Bar)
        app.get_monitors().map(SystemMenu)
    },
})
