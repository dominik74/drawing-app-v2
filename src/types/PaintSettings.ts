import { Brush } from "./Brush";
import { Shape } from "./Shape";
import { Tool } from "./Tool";

export interface AppSettings {
	selectedTool: Tool;
	brush: Brush;
	shape?: Shape;
}
