import styled from "styled-components";
import { Button } from "./Button";
import { Tool } from "../types/Tool";
import { Brush } from "../types/Brush";
import { DEFAULT_BRUSH_SIZE, MAX_BRUSH_SIZE } from "../constants";
import { useEffect, useState } from "react";
import { Shape } from "../types/Shape";
import { Font } from "../types/Font";
import { ShapeType } from "../types/ShapeType";

const StyledToolbar = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	width: 32px;
	height: 100vh;
	background: lightgray;	
	display: flex;
	flex-direction: column;
	// align-items: center;
	gap: 5px;
	// padding: 5px;
	box-sizing: border-box;
	border-right: 1px solid gray;

	// > * {
	// 	width: 48px;
	// 	height: 48px;
	// 	font-size: large;
	// }

	> .tool-name {
		font-weight: bold;
	}
`;

interface StyledButtonProps {
	$isSelected: boolean;
}

const StyledButton = styled.div<StyledButtonProps>`
	background: transparent;
	border: none;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 24px;

	background: ${props => (
		props.$isSelected ? "black" : "transparent"
	)};

	color: ${props => (
		props.$isSelected ? "white" : "black"
	)};

	&:hover {
		background: black;
		color: white;
	}
`;

interface Props {
	selectedTool: Tool;	
	setSelectedTool: (tool: Tool) => void;
}

export default function Toolbar(props: Props) {
	return (
		<StyledToolbar>
			<StyledButton
				onClick={() => props.setSelectedTool(Tool.brush)}
				$isSelected={props.selectedTool === Tool.brush}
			>
				B
			</StyledButton>

			<StyledButton
				onClick={() => props.setSelectedTool(Tool.transform)}
				$isSelected={props.selectedTool === Tool.transform}
			>
				T
			</StyledButton>

			<StyledButton
				onClick={() => props.setSelectedTool(Tool.shape)}
				$isSelected={props.selectedTool === Tool.shape}
			>
				S
			</StyledButton>

			<StyledButton
				onClick={() => props.setSelectedTool(Tool.text)}
				$isSelected={props.selectedTool === Tool.text}
			>
				TE
			</StyledButton>

		</StyledToolbar>
	);
}
