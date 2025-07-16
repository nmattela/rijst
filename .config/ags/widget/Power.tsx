import { Gtk } from "ags/gtk4"

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