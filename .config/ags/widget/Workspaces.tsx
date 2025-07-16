import Hyprland from "gi://AstalHyprland"
import app from "ags/gtk4/app"
import { Gtk } from "ags/gtk4"
import { Accessor, createBinding, For, With } from "ags"

export default function Workspaces() {
    const hyprland = Hyprland.get_default()
    const totalWorkspaces = 10
    const workspaces: Accessor<Array<[Hyprland.Workspace | undefined, number]>> = createBinding(hyprland, `workspaces`).as(workspaces => Array.from({ length: totalWorkspaces }).map((_, i) =>
        [workspaces.find(workspace => workspace.id === i+1), i]
    ))
    const focusedWorkspace = createBinding(hyprland, `focusedWorkspace`)

    return (
        <box
            class="Workspaces"
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
            spacing={10}
        >
            <For each={workspaces} id={([_, i]) => i}>
                {([ws, i]) => (
                    <button
                        class={focusedWorkspace.as(focusedWorkspace => `workspace ${ws !== undefined ? `workspace-used` : ``} ${ws === focusedWorkspace ? `workspace-focused` : ``}`)}
                        onClicked={() => (
                            ws !== undefined
                                ? ws.focus()
                                : hyprland.dispatch(`workspace`, `${i + 1}`)
                        )}
                        widthRequest={28}
                        heightRequest={28}
                    >
                        <box></box>
                    </button>
                )}
            </For>
        </box>
    )
}