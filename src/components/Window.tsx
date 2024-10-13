import styled from "styled-components";
import { HIGHLIGHT_COLOR, PANEL_PRIMARY_COLOR, PANEL_SECONDARY_COLOR } from "../constants";

const StyledWindow = styled.div`
	position: absolute;
	top: 28px;
	right: 28px;
	width: 300px;
	height: 300px;
	background: ${PANEL_PRIMARY_COLOR};	
	border: 1px solid gray;
	display: flex;
	flex-direction: column;
`;

const StyledTitleBar = styled.div`
	// flex items-center justify-between
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${PANEL_SECONDARY_COLOR};
	padding: 0 4px;
`;

const StyledBody = styled.div`
	padding: 4px;
	overflow-y: auto;
`;

const StyledButton = styled.div`
	background: transparent;
	width: 24px;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background: ${HIGHLIGHT_COLOR};
		color: white;
	}
`;

interface Props {
	title: string;
	children?: React.ReactNode;
	onClose: () => void;	
}

export default function Window(props: Props) {
	return (
		<StyledWindow>
			<StyledTitleBar>
				{props.title}
				<StyledButton
					onClick={props.onClose}
				>
					X
				</StyledButton>
			</StyledTitleBar>

			<StyledBody>
				{props.children}
			</StyledBody>
		</StyledWindow>
	);
}
