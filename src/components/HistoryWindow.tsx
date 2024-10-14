import Window from "./Window";
import { CanvasObject } from "../types/CanvasObject";

interface Props {
	onClose: () => void;	
	history: CanvasObject[][];
}

export default function HistoryWindow(props: Props) {
	return (
		<Window
			title='history'
			onClose={props.onClose}
		>
			{props.history.map((_, i) => (
				<p key={i}>snapshot {i + 1}</p>
			))}
		</Window>
	);
}
