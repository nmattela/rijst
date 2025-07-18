import { Gtk } from "ags/gtk4"

export default function Power() {
    return (
        <box class="Power">
            <button
                class="icon circular"
                widthRequest={30}
                halign={Gtk.Align.END}
                iconName={`system-shutdown`}
            />
        </box>
    )
}