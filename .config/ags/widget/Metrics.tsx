import app from "ags/gtk4/app"
import Apps from "gi://AstalApps"

const appsClient = new Apps.Apps({
    nameMultiplier: 2,
    entryMultiplier: 0,
    executableMultiplier: 2,
  })

export default function Metrics() {
        
    return (
        <box>

        </box>
    )
}