import styled from "styled-components";
import { CanvasObject } from "../types/CanvasObject";

const StyledUndoRedoBar = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	width: 150px;
	height: 24px;
	background: darkblue;	
`;

interface Props {
	historyIndex: number;
	setHistoryIndex: (index: number) => void;
	history: CanvasObject[][];
	setIsHistoryVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UndoRedoBar(props: Props) {
	function undo() {
        if (props.history.length === 0)
            return;

        let newHistoryIndex = props.historyIndex;

        if (newHistoryIndex > 0)
            newHistoryIndex--;

		props.setHistoryIndex(newHistoryIndex);
	}

	function redo() {
        if (props.history.length === 0)
            return;

        let newHistoryIndex = props.historyIndex;

        if (newHistoryIndex < props.history.length - 1)
            newHistoryIndex++;

		props.setHistoryIndex(newHistoryIndex);
	}

	return (
		<StyledUndoRedoBar>
			<button
				onClick={() => props.setIsHistoryVisible(true)}
			>
				history
			</button>

			<button
				onClick={undo}
			>
				undo
			</button>

			<button
				onClick={redo}
			>
				redo
			</button>
		</StyledUndoRedoBar>
	);
}
