import { Gtk } from "ags/gtk3"

export default function Power() {
    return (
        <button
            class="icon circular Power"
            widthRequest={40}
            halign={Gtk.Align.END}
        >
            󰐥
        </button>
    )
}