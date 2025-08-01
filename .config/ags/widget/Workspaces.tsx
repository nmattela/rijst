import Hyprland from "gi://AstalHyprland"
import app from "ags/gtk4/app"
import { Gdk, Gtk } from "ags/gtk4"
import { Accessor, createBinding, createComputed, For, With } from "ags"
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

    const clients = createBinding(hyprland, `clients`)
    const focusedClient: Accessor<Hyprland.Client | null> = createBinding(hyprland, `focusedClient`)

    const computed = createComputed([focusedWorkspace, clients, focusedClient])


    return (
        <With value={computed}>
            {([focusedWorkspace, clients, focusedClient]) => (
                <box
                    class="Workspaces"
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.START}
                    spacing={10}
                >
                    <For each={workspaces}>
                        {([ws, i]) => {

                            const workspaceClients = clients.filter(c => c.workspace.id === ws?.id)

                            const icons = workspaceClients.map<[Hyprland.Client, string, number]>(client => [client, apps.fuzzy_query(client.class).at(0)?.iconName ?? `dot-symbolic`, i]) ?? []
                            const currentIcon = icons.filter(([client]) => !client.hidden)
                            const isFocused = (i + 1) === focusedWorkspace.id

                            const shownClients: Array<[Hyprland.Client | undefined, string, number]> = icons.length === 0 ? [[undefined, ``, i]] : isFocused ? icons : currentIcon

                            // console.log(`workspace ${i+1}`, shownClients)
                            // console.log(`workspace ${i+1} is ${ws !== undefined ? `not ` : ``}undefined. Focused workspace is ${focusedWorkspace.id}. isFocus?: ${isFocused}`)

                            // console.log(`Workspace ${i+1}, focused is ${isFocused}: workspace ${isFocused ? `workspace-focused` : icons.length > 0 ? `workspace-used` : ``}`)

                            return (
                                <box
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    spacing={0}
                                    heightRequest={28}
                                >
                                    {
                                        shownClients.map(([client, icon]) => (
                                            <button
                                                class={`workspace ${isFocused ? `workspace-focused` : client !== undefined ? `workspace-used` : ``} ${focusedClient?.address === client?.address ? `workspace-focused-app-focused` : ``}`}
                                                onClicked={
                                                    isFocused && client !== undefined
                                                        ? () => client.focus()
                                                        : () => (
                                                            ws !== undefined
                                                                ? ws.focus()
                                                                : hyprland.dispatch(`workspace`, `${i + 1}`)
                                                        )
                                                }
                                                cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                                                tooltipText={isFocused && client !== undefined ? client.title : `Workspace ${i + 1} - ${workspaceClients.length} window${workspaceClients.length !== 1 ? `s` : ``} open`}
                                                valign={Gtk.Align.CENTER}
                                                widthRequest={28}
                                                heightRequest={28}
                                                iconName={icon}
                                            >
                                            </button>
                                        ))
                                    }
                                </box>
                            )
                        }}
                    </For>
                </box>
            )}
        </With>
    )
}