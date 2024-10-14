import { Brush } from "./Brush";
import { Point } from "./Point";
import { Transform } from "./Transform";

export interface Line {
    points: Point[];
    brush: Brush,
    transform: Transform;
    isSelected: boolean;
}
