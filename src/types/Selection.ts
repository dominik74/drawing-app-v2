import { CanvasObject } from "./CanvasObject";

export interface CoSelection {
	id: string,
	selectedObjects: ({
		co: CanvasObject;
		selectionId: string;
		index: number;
	})[];
}
