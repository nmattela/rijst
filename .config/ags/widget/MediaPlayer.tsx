import { createBinding, createComputed, createState, For, With } from "ags"
import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import { createPoll } from "ags/time"
import Mpris from "gi://AstalMpris"
import GLib from "gi://GLib?version=2.0"
import Pango from "gi://Pango?version=1.0"

export default function MediaPlayer() {
    
    const mpris = Mpris.get_default()

    mpris.connect(`notify::players`, () => console.log(`notify::players`))
    mpris.connect(`notify`, () => console.log(`notify`))

    const players = createPoll([], 500, () => mpris.players) //createBinding(mpris, `players`)
    const [currentPlayerIndex, setCurrentPlayerIndex] = createState<number | undefined>(undefined)
    const [currentPlayer, setCurrentPlayer] = createState(players.get().at(0))
    // const currentPlayer = players.as(players => players.find(player => player.playbackStatus === Mpris.PlaybackStatus.PLAYING) ?? players.at(0))

    players.subscribe(() => {
        if(currentPlayerIndex.get() === undefined) {
            setCurrentPlayer(players.get().find(player => player.playbackStatus === Mpris.PlaybackStatus.PLAYING) ?? players.get().at(0))
        }
    })

    currentPlayerIndex.subscribe(() => {
        if(currentPlayerIndex.get() !== undefined) {
            setCurrentPlayer(currentPlayer => players.get().at(currentPlayerIndex.get()!) ?? currentPlayer)
        }
    })

    const timeToLabel = (time: number) => {
        const minutesFloat = time / 60
        const minutes = Math.floor(minutesFloat)
        const seconds = Math.round((minutesFloat - minutes) * 60)
        const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()
        const secondsString = seconds < 10 ? `0${seconds}` : seconds.toString()
        return `${minutesString}:${secondsString}`
    }

    const currentTimeLabel = currentPlayer.as(currentPlayer => timeToLabel(currentPlayer?.position ?? 0))
    const totalTimeLabel = currentPlayer.as(currentPlayer => timeToLabel(currentPlayer?.length ?? 0))

    const both = createComputed([players, currentPlayer])

    return (
        <With value={both}>
            {([players, currentPlayer]) => {
                const canPlayPause = currentPlayer?.playbackStatus === Mpris.PlaybackStatus.PLAYING ? currentPlayer.canPause : currentPlayer?.canPlay ?? false
                return players.length > 0 && currentPlayer !== undefined && (
                    <box
                        heightRequest={300}
                        // widthRequest={300}
                        class="MediaPlayer"
                        css={currentPlayer.artUrl !== undefined && currentPlayer.artUrl !== `` ? `background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), url(${currentPlayer.artUrl});` : ``}
                        valign={Gtk.Align.CENTER}
                        vexpand
                    >
                        <box
                            orientation={Gtk.Orientation.VERTICAL}
                            valign={Gtk.Align.END}
                        >
                            <box
                                class="description"
                                orientation={Gtk.Orientation.VERTICAL}
                                halign={Gtk.Align.START}
                                valign={Gtk.Align.END}
                            >
                                <label
                                    class="title"
                                    maxWidthChars={50}
                                    ellipsize={Pango.EllipsizeMode.END}
                                    label={currentPlayer?.title}
                                    halign={Gtk.Align.START} />
                                {currentPlayer?.artist !== undefined && currentPlayer.artist !== `` && (
                                    <label
                                        class="artist"
                                        maxWidthChars={50}
                                        ellipsize={Pango.EllipsizeMode.END}
                                        label={currentPlayer.artist}
                                        halign={Gtk.Align.START} />
                                )}
                            </box>
                            <box
                                class="controls"
                                orientation={Gtk.Orientation.VERTICAL}
                                spacing={10}
                            >
                                <box
                                    class="playback"
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    halign={Gtk.Align.CENTER}
                                    spacing={10}
                                >
                                    <button
                                        iconName={currentPlayer.shuffleStatus === Mpris.Shuffle.ON ? `media-playlist-shuffle` : `no-shuffle-symbolic`}
                                        cursor={currentPlayer.shuffleStatus === Mpris.Shuffle.UNSUPPORTED ? undefined : Gdk.Cursor.new_from_name(`pointer`, null)}
                                        class={currentPlayer.shuffleStatus === Mpris.Shuffle.UNSUPPORTED ? `disabled` : undefined}
                                        tooltipText={(() => {
                                            switch (currentPlayer.shuffleStatus) {
                                                case Mpris.Shuffle.ON: return `Disable shuffling`
                                                case Mpris.Shuffle.OFF: return `Enable shuffling`
                                                default: return `Shuffling not available`
                                            }
                                        })()}
                                        onClicked={currentPlayer.shuffleStatus === Mpris.Shuffle.UNSUPPORTED ? undefined : () => {
                                            currentPlayer.shuffle()
                                        } } />
                                    <button
                                        iconName={`media-skip-backward`}
                                        class={currentPlayer.canGoPrevious ? undefined : `disabled`}
                                        tooltipText={currentPlayer.canGoPrevious ? `Go to previous track` : `Cannot go to previous track`}
                                        cursor={currentPlayer.canGoPrevious ? Gdk.Cursor.new_from_name(`pointer`, null) : undefined}
                                        onClicked={!currentPlayer.canGoPrevious ? undefined : () => {
                                            currentPlayer.previous()
                                        }}
                                    />
                                    <button
                                        iconName={currentPlayer?.playbackStatus === Mpris.PlaybackStatus.PAUSED ? `media-playback-start` : `media-playback-pause`}
                                        class={canPlayPause ? undefined : `disabled`}
                                        cursor={canPlayPause ? Gdk.Cursor.new_from_name(`pointer`, null) : undefined}
                                        onClicked={!canPlayPause ? undefined : (() => {
                                            currentPlayer.play_pause()
                                        })} />
                                    <button
                                        iconName={`media-skip-forward`}
                                        class={currentPlayer.canGoNext ? undefined : `disabled`}
                                        tooltipText={currentPlayer.canGoNext ? `Go to next track` : `Cannot go to next track`}
                                        cursor={currentPlayer.canGoNext ? Gdk.Cursor.new_from_name(`pointer`, null) : undefined}
                                        onClicked={!currentPlayer.canGoPrevious ? undefined : () => {
                                            currentPlayer.next()
                                        }}
                                    />
                                    <button
                                        iconName={(() => {
                                            switch (currentPlayer.loopStatus) {
                                                case Mpris.Loop.NONE: return `playlist-symbolic`
                                                case Mpris.Loop.TRACK: return `repeat-once-symbolic`
                                                default: return `repeat-symbolic`
                                            }
                                        })()}
                                        cursor={currentPlayer.loopStatus === Mpris.Loop.UNSUPPORTED ? undefined : Gdk.Cursor.new_from_name(`pointer`, null)}
                                        class={currentPlayer.loopStatus === Mpris.Loop.UNSUPPORTED ? `disabled` : undefined}
                                        tooltipText={(() => {
                                            switch (currentPlayer.loopStatus) {
                                                case Mpris.Loop.NONE: return `Looping disabled`
                                                case Mpris.Loop.TRACK: return `Looping tack`
                                                case Mpris.Loop.PLAYLIST: return `Looping playlist`
                                                default: return `Looping not available`
                                            }
                                        })()}
                                        onClicked={currentPlayer.loopStatus === Mpris.Loop.UNSUPPORTED ? undefined : () => {
                                            currentPlayer.loop()
                                        } } />
                                </box>
                                <box
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                >
                                    <label label={currentTimeLabel} />
                                    <slider
                                        class="slider"
                                        orientation={Gtk.Orientation.HORIZONTAL}
                                        visible={currentPlayer.length > 0}
                                        min={0}
                                        max={currentPlayer.length}
                                        value={currentPlayer.position}
                                        hexpand
                                        valuePos={Gtk.PositionType.RIGHT}
                                        onChangeValue={({ value }) => currentPlayer.set_position(value)}
                                    />
                                    <label label={totalTimeLabel} />
                                </box>
                                <box
                                    class="player-selection"
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    halign={Gtk.Align.CENTER}
                                    spacing={10}
                                >
                                    {players.map((player, i) => (
                                        <button
                                            label={currentPlayer.identity === player.identity ? `•` : `◦`}
                                            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                                            onClicked={() => {
                                                setCurrentPlayerIndex(i)
                                            }}
                                        />
                                    ))}
                                </box>
                            </box>
                        </box>
                    </box>
                )
            }}
        </With>
    )
}