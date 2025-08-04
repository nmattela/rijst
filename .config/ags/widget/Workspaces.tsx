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
                        {([workspace, i]) => (
                            <WorkspaceButton
                                workspace={workspace}
                                index={i}
                                clients={clients.filter(c => c.workspace.id === workspace?.id)}
                                focusedClient={focusedClient ?? undefined}
                                isWorkspaceFocused={(i + 1) === focusedWorkspace.id}
                                onClick={() => (
                                    workspace !== undefined
                                        ? workspace.focus()
                                        : hyprland.dispatch(`workspace`, `${i + 1}`)
                                )}
                            />
                        )}
                    </For>
                </box>
            )}
        </With>
    )
}

function WorkspaceButton({ workspace, index, isWorkspaceFocused, focusedClient, clients, onClick }: { workspace: Hyprland.Workspace | undefined, index: number, isWorkspaceFocused: boolean, focusedClient?: Hyprland.Client, clients: Array<Hyprland.Client>, onClick: () => void }) {

    const icons = clients.map<[Hyprland.Client, string]>(client => [client, apps.fuzzy_query(client.class).at(0)?.iconName ?? `dot-symbolic`]) ?? []
    const currentIcon = icons.filter(([client]) => !client.hidden)

    const shownClients: Array<[Hyprland.Client | undefined, string]> = isWorkspaceFocused ? icons : currentIcon

    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={0}
            heightRequest={28}
            tooltipText={!isWorkspaceFocused || clients.length === 0 ? `Workspace ${workspace?.name ?? index+1} - ${clients.length} window${clients.length !== 1 ? `s` : ``} open` : undefined}
        >
            {
                clients.length > 0
                    ? shownClients.map(([client, icon]) => (
                        <WorkspaceClientButton
                            client={client}
                            icon={icon}
                            isClientFocused={focusedClient?.address === client?.address}
                            isWorkspaceFocused={isWorkspaceFocused}
                            onClick={(
                                isWorkspaceFocused && client !== undefined
                                    ? () => client.focus()
                                    : onClick
                            )}
                        />
                    ))
                    : (
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={0}
                            heightRequest={28}
                        >
                            <WorkspaceClientButton
                                isWorkspaceFocused={isWorkspaceFocused}
                                onClick={onClick}    
                            />
                        </box>
                    )
            }
        </box>
    )
}

function WorkspaceClientButton({ isWorkspaceFocused, client, isClientFocused, icon, onClick }: { isWorkspaceFocused: boolean, client?: Hyprland.Client, isClientFocused?: boolean, icon?: string, onClick: () => void }) {
    return (
        <button
            class={`workspace ${isWorkspaceFocused ? `workspace-focused` : client !== undefined ? `workspace-used` : ``} ${isClientFocused ? `workspace-focused-app-focused` : ``}`}
            onClicked={onClick}
            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
            tooltipText={isWorkspaceFocused && client !== undefined ? client.title : undefined}
            valign={Gtk.Align.CENTER}
            widthRequest={28}
            heightRequest={28}
            iconName={icon}
        >
        </button>
    )
}