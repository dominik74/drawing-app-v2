import styled from "styled-components";
import { Tool } from "../types/Tool";
import { Brush } from "../types/Brush";
import { Shape } from "../types/Shape";
import { Font } from "../types/Font";
import { MAX_BRUSH_SIZE, PANEL_PRIMARY_COLOR } from "../constants";
import { ShapeType } from "../types/ShapeType";

const StyledToolPropertiesBar = styled.div`
	position: absolute;
	top: 0;
	left: 30px;
	width: calc(100vw - 32px);
	height: 24px;
	background: ${PANEL_PRIMARY_COLOR};
	display: flex;
	gap: 4px;
	border-bottom: 1px solid gray;

	> * {
		display: flex;
		align-items: center;
	}

	> .tool-name {
		// background: black;
		// color: white;
		font-weight: bold;
		// padding: 2px;
		margin-left: 10px;
		margin-right: 10px;
	}
`;

interface Props {
	selectedTool: Tool;	
	setSelectedTool: (tool: Tool) => void;
	brushSettings: Brush;
	setBrushSettings: (brush: Brush) => void;
	shapeSettings: Shape;
	setShapeSettings: (shape: Shape) => void;
	fontSettings: Font;
	setFontSettings: (font: Font) => void;
	documentBackgroundColor: string;
	setDocumentBackgroundColor: (bgColor: string) => void;
}

export default function ToolPropertiesBar(props: Props) {
	const fmtBrushThickness = props.brushSettings.thickness < 10 ? `0${props.brushSettings.thickness }` : props.brushSettings.thickness ;

	function handleBrushThicknessChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setBrushSettings({
			...props.brushSettings,
			thickness: parseInt(e.target.value)
		});
	}

	function handleBrushColorChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setBrushSettings({
			...props.brushSettings,
			color: e.target.value
		});
	}

	function handleBrushOpacityChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setBrushSettings({
			...props.brushSettings,
			opacity: parseFloat(e.target.value)
		});
	}

	function handleIsFilledChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setShapeSettings({
			...props.shapeSettings,
			isFilled: e.target.checked
		});
	}

	function handleFontSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setFontSettings({
			...props.fontSettings,
			fontSize: parseInt(e.target.value)
		});
	}

	function handleFontFamilyChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setFontSettings({
			...props.fontSettings,
			fontFamily: e.target.value
		});
	}

	function handleShapeTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
		props.setShapeSettings({
			...props.shapeSettings,
			type: parseInt(e.target.value)
		});

		console.log(e.target.selectedIndex);
	}

	function handleDocumentBackgroundColorChange(e: React.ChangeEvent<HTMLInputElement>) {
		props.setDocumentBackgroundColor(e.target.value);
	}

	return (
		<StyledToolPropertiesBar>
			<span className="tool-name">{Tool[props.selectedTool]}</span>

			{(props.selectedTool === Tool.brush || props.selectedTool === Tool.shape) &&
				<>
					<span>brush thickness: {fmtBrushThickness}</span>

					<input
						type="range"
						min={0}
						max={MAX_BRUSH_SIZE}
						value={props.brushSettings.thickness}
						onChange={handleBrushThicknessChange}
					/>

					<span>color: </span>

					<input
						type="color"
						value={props.brushSettings.color}
						onChange={handleBrushColorChange}
					/>

					<span>opacity: {props.brushSettings.opacity.toFixed(2)}</span>

					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={props.brushSettings.opacity}
						onChange={handleBrushOpacityChange}
					/>
				</>
			}

			{props.selectedTool === Tool.shape &&
				<>
					<label htmlFor="is_filled_checkbox">is filled</label>
					<input
						type="checkbox"
						id="is_filled_checkbox"
						checked={props.shapeSettings.isFilled}
						onChange={handleIsFilledChange}
					/>
						
					{/* <input */}
					{/* 	list="shapes_list" */}
					{/* 	placeholder="select a shape" */}
					{/* /> */}
					{/*  */}
					{/* <datalist id="shapes_list"> */}
					{/* 	{shapeTypes.map((shape, index) => ( */}
					{/* 	<option key={index} value={shape} /> */}
					{/* 	))}	 */}
					{/* </datalist> */}

					<label htmlFor="shape_select">type:</label>

					<select
						id="shape_select"
						value={props.shapeSettings.type}
						onChange={handleShapeTypeChange}
					>
						<option value={ShapeType.reactangle}>rectangle</option>
						<option value={ShapeType.ellipse}>ellipse</option>
						<option value={ShapeType.triangle}>triangle</option>
					</select>
				</>
			}

			{props.selectedTool === Tool.text &&
				<>
					<label htmlFor="font_family">font family</label>
					<input
						id="font_family"
						type="text"
						value={props.fontSettings.fontFamily}
						onChange={handleFontFamilyChange}
					/>

					<label htmlFor="font_size">font size</label>
					<input
						id="font_size"
						type="number"
						value={props.fontSettings.fontSize}
						onChange={handleFontSizeChange}
					/>
				</>
			}

			<label htmlFor="document_background_color">document background color:</label>
			<input
				id="document_background_color"
				type="color"
				value={props.documentBackgroundColor}
				onChange={handleDocumentBackgroundColorChange}
			/>

		</StyledToolPropertiesBar>
	);
}
