import Hyprland from "gi://AstalHyprland"
import app from "ags/gtk4/app"
import { Gdk, Gtk } from "ags/gtk4"
import { Accessor, createBinding, For, With } from "ags"
import Apps from "gi://AstalApps"

const apps = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 0,
  executableMultiplier: 2,
})

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
                {([ws, i]) => {

                    const icons = ws?.clients.map<[string, boolean]>(client => [apps.fuzzy_query(client.class).at(0)?.iconName ?? `dot-symbolic`, !client.hidden]) ?? []
                    const currentIcon = icons.filter(([_, main]) => main)

                    return (
                        <button
                            class={focusedWorkspace.as(focusedWorkspace => `workspace ${ws !== undefined ? `workspace-used` : ``} ${(i + 1) === focusedWorkspace.id ? `workspace-focused` : ``}`)}
                            onClicked={() => (
                                ws !== undefined
                                    ? ws.focus()
                                    : hyprland.dispatch(`workspace`, `${i + 1}`)
                            )}
                            widthRequest={28}
                            heightRequest={28}
                            valign={Gtk.Align.CENTER}
                            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                        >
                            <With value={focusedWorkspace}>
                                {focusedWorkspace => (
                                    <box
                                        orientation={Gtk.Orientation.HORIZONTAL}
                                        spacing={5}
                                    >
                                        {
                                            ((i+1) === focusedWorkspace.id ? icons : currentIcon).map(([icon, main]) => (
                                                <image
                                                    iconName={icon}
                                                    iconSize={Gtk.IconSize.NORMAL}
                                                    pixelSize={main ? 13 : 10}
                                                />
                                            ))
                                        }  
                                    </box>
                                )}
                            </With>
                        </button>
                    )
                }}
            </For>
        </box>
    )
}