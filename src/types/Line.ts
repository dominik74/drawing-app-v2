import { Brush } from "./Brush";
import { CanvasObject } from "./CanvasObject";
import { Point } from "./Point";
import { Transform } from "./Transform";

export interface Line {
    points: Point[];
    brush: Brush,
    transform: Transform;
    isSelected: boolean;
}
