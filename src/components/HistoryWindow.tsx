import styled from "styled-components";
import Window from "./Window";
import { CanvasObject } from "../types/CanvasObject";

const StyledHistoryWindow = styled.div`
	
`;

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
			{props.history.map((snapshot, i) => (
				<p key={i}>snapshot {i + 1}</p>
			))}
		</Window>
	);
}
