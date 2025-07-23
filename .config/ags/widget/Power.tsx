import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { exec, execAsync } from "ags/process"

export function PowerButton() {
    return (
        <box class="PowerButton">
            <button
                class="icon circular"
                widthRequest={30}
                halign={Gtk.Align.END}
                iconName={`system-shutdown`}
                cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                onClicked={() => {
                    // app.get_window(`Power`)?.set_visible(true)
                    app.toggle_window(`Power`)
                }}
            />
        </box>
    )
}

export function Power(gdkmonitor: Gdk.Monitor) {
    return (
        <window
            class={`Power`}
            name={`Power`}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.EXCLUSIVE}
            application={app}
            // visible={true}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
            gdkmonitor={gdkmonitor}
            widthRequest={0}
            heightRequest={0}
        >
            <Gtk.EventControllerKey
                onKeyPressed={({ widget }, keyval) => {
                    if (keyval === Gdk.KEY_Escape) {
                        widget.hide()
                    }
                }}
            />
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={10}
                hexpand={false}
                vexpand={false}
                widthRequest={300}
                heightRequest={300}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                <button
                    class="shutdown"
                    widthRequest={300}
                    heightRequest={300}
                    iconName={`system-shutdown`}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    onClicked={() => execAsync(`shutdown -h now`).catch(console.log)}
                />
                <button
                    class="reboot"
                    widthRequest={300}
                    heightRequest={300}
                    iconName={`system-reboot`}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    onClicked={() => execAsync(`reboot -h now`)}
                />
                <button
                    class="lock"
                    widthRequest={300}
                    heightRequest={300}
                    iconName={`system-lock-screen`}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    onClicked={() => execAsync(`swaylock -f -c 000000`)}
                />
                <button
                    class="logout"
                    widthRequest={300}
                    heightRequest={300}
                    iconName={`system-log-out`}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    onClicked={() => execAsync(`hyprctl dispatch exit ok`)}
                />
            </box>
        </window>
    )
}