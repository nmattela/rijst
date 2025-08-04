import { Gtk, Gdk } from 'ags/gtk4'


export function CircularProgress({
    size = 100,
    thickness = 8,
    color = '#3399ff',
    bgColor,
    fontSize = 16,
    textColor = '#FFFFFF',
    progress = 75,
    label
}: {
    size?: number,
    thickness?: number,
    color?: string,
    bgColor?: string,
    fontSize?: number,
    textColor?: string,
    progress: number,
    label?: string,
}) {

    return (
        <Gtk.DrawingArea
            contentHeight={size}
            contentWidth={size}
            $={(self) => self.set_draw_func((_, cr, width, height) => {
                const cx = width / 2;
                const cy = height / 2;
                const radius = (Math.min(width, height) - thickness) / 2;
    
                // Background Circle
                const bg = bgColor !== undefined ? hexToRgb(bgColor) : undefined
                if(bg !== undefined) {
                    cr.setSourceRGBA(bg.r, bg.g, bg.b, 1);
                } else {
                    cr.setSourceRGBA(0, 0, 0, 0)
                }
                
                cr.setLineWidth(thickness);
                cr.arc(cx, cy, radius, 0, 2 * Math.PI);
                cr.stroke();
    
                // Progress Arc
                const col = hexToRgb(color)
                if(col !== undefined) {
                    cr.setSourceRGBA(col.r, col.g, col.b, 1);
                }
                cr.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
                cr.stroke();

                const textColorRgb = hexToRgb(textColor)

                // Label Text
                if(label !== undefined) {
                    cr.setFontSize(fontSize);
                    if(textColorRgb !== undefined) {
                        cr.setSourceRGBA(textColorRgb.r, textColorRgb.g, textColorRgb.b, 1);
                    }
                    const titleExtents = cr.textExtents(label)
                    cr.moveTo(cx - titleExtents.width / 2, cy + titleExtents.height / 2 - fontSize)
                    cr.showText(label)
                }

                // Percentage Text
                const percentageText = `${Math.round(progress * 100)}%`;
                cr.setFontSize(fontSize);
                if(textColorRgb !== undefined) {
                    cr.setSourceRGBA(textColorRgb.r, textColorRgb.g, textColorRgb.b, 1);
                }
                const extents = cr.textExtents(percentageText);
                cr.moveTo(cx - extents.width / 2, cy + extents.height / 2 + (label !== undefined ? fontSize : 0));
                cr.showText(percentageText);
            })}
        ></Gtk.DrawingArea>
    )
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : undefined;
  }