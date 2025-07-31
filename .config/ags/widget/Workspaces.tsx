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

                            const icons = workspaceClients.map<[Hyprland.Client, string]>(client => [client, apps.fuzzy_query(client.class).at(0)?.iconName ?? `dot-symbolic`]) ?? []
                            const currentIcon = icons.filter(([client]) => !client.hidden)
                            const isFocused = (i + 1) === focusedWorkspace.id

                            const iconsView = (
                                <box
                                    class={isFocused ? `workspace-focused-apps` : ``}
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    spacing={0}
                                >
                                    {
                                        (isFocused ? icons : currentIcon).map(([client, icon]) => (
                                            <button
                                                class={`${isFocused ? `workspace-focused-app` : ``} ${focusedClient?.address === client.address ? `workspace-focused-app-focused` : ``}`}
                                                onClicked={() => client.focus()}
                                                cursor={isFocused ? Gdk.Cursor.new_from_name(`pointer`, null) : undefined}
                                            >
                                                <image
                                                    class={isFocused ? `workspace-focused-app-image` : ``}
                                                    iconName={icon}
                                                    iconSize={Gtk.IconSize.NORMAL}
                                                    pixelSize={client.hidden ? 10 : 13}
                                                />
                                            </button>
                                        ))
                                    }
                                </box>
                            )

                            if(isFocused && workspaceClients.length > 0) {
                                return (
                                    iconsView
                                )
                            } else {
                                return (
                                    <button
                                        class={`workspace ${ws !== undefined ? `workspace-used` : ``} ${isFocused ? `workspace-focused` : ``}`}
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
                                        {iconsView}
                                    </button>
                                )
                            }

                        }}
                    </For>
                </box>
            )}
        </With>
    )
}