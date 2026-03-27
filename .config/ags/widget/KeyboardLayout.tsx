import { Gdk, Gtk } from "ags/gtk4";
import Fcitx5 from "../utils/Fcitx5";
import { createBinding, For, With } from "ags";

export default function KeyboardLayout() {

    const fcitx5 = new Fcitx5()
    const layouts = createBinding(fcitx5, `layouts`)
    const currentLayout = createBinding(fcitx5, `current`)

    return (
        <box
            class="KeyboardLayout"
            orientation={Gtk.Orientation.HORIZONTAL}
        >
            <With value={currentLayout}>
                {currentLayout => (
                    <box
                        class="buttons"
                    >
                        <For each={layouts}>
                            {layout => {
                                const isCurrent = currentLayout === layout.Name
                                return (
                                    <button
                                        class={`button ${isCurrent ? `button-focus` : ``}`}
                                        label={fcitx5.layoutToFlag(layout)}
                                        cursor={isCurrent ? undefined : Gdk.Cursor.new_from_name(`pointer`, null)}
                                        onClicked={() => fcitx5.current = layout.Name}
                                        tooltipText={isCurrent ? `Using ${layout.Name} layout` : `Switch to ${layout.Name} layout`} />
                                );
                            }}
                        </For>
                    </box>
                )}
            </With>
        </box>
    )
}