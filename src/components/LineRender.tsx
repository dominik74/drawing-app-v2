import { ChangeEventHandler, useEffect, useState } from "react";
import styled from "styled-components";

function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

interface StyledLineProps {
    $isSelected: boolean;
    $left: number;
    $top: number;
    $width: number;
    $height: number;
    $rotation: number;
    $isController: boolean
}

const StyledLine = styled.div.attrs<StyledLineProps>(props => ({
    style: {
        transform: `rotate(${props.$rotation}deg)`,
        left: `${props.$left}px`,
        top: `${props.$top}px`,
        width: `${props.$width}px`,
        height: `${props.$height}px`,
    } 
}))<StyledLineProps>`
    position: absolute;
    display: flex;
    border: ${props =>
        props.$isSelected ?
            (props => props.$isController ? "1px solid gray" : "1px solid red")
        :
            "none"
    };  

    > .resize-handle-left {
      align-self: end;
      text-align: center;
      width: 20px;
      height: 20px;
      background: gray;
      color: white;
      visibility: ${props => props.$isSelected ? "visible" : "hidden"};
    }

    > .rotate-handle {
      margin: 0 auto;
      text-align: center;
      width: 20px;
      height: 20px;
      background: white;
      color: black;
      visibility: ${props => props.$isSelected ? "visible" : "hidden"};
    }

    > textarea {
        // background: transparent;
        margin-right: 4px;
    }
`;

interface LineRenderProps {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onScaleBegin: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onScaleEnd: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onRotateBegin: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onRotateEnd: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    width: number;
    height: number;
    top: number;
    left: number;
    isSelected: boolean;
    rotation: number;
    text?: string;
    setText?: (newText: string) => void;
    fontSize?: number;
    isController: boolean;
}

export default function LineRender(props: LineRenderProps) {

    useEffect(() => {
        const editableSpan = document.getElementById("editable_span") as HTMLSpanElement | null;
        if (editableSpan && props.text) {
            editableSpan.textContent = props.text;
        }
    }, [props.text]);

    function beginScale(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        props.onScaleBegin(e);
    }

    function endScale(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        props.onScaleEnd(e);
    }

    function beginRotate(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        props.onRotateBegin(e);
    }

    function endRotate(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        props.onRotateEnd(e);
    }

    function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        // console.log("text changed: " + e.target.value);
        props.setText?.(e.target.value);
    }

    function handleTextAreaFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
        const length = e.currentTarget.value.length;
        e.currentTarget.setSelectionRange(0, length);
    }

    return (
        <StyledLine
            onMouseDown={props.onMouseDown}
            $isSelected={props.isSelected}
            $left={props.left}
            $top={props.top}
            $width={props.width}
            $height={props.height}
            $rotation={props.rotation}
            $isController={props.isController}
        >

            {props.isController &&
                <>
                    <div
                        className="rotate-handle"
                        onMouseDown={beginRotate}
                        onMouseUp={endRotate}
                    >
                        R
                    </div>

                    <div
                        className="resize-handle-left"
                        onMouseDown={beginScale}
                        onMouseUp={endScale}
                    >
                        S
                    </div>
                </>
            }

            {(props.text !== undefined && props.isSelected) &&
                <>
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0
                        }}
                    >
                        <textarea
                            autoFocus
                            onFocus={handleTextAreaFocus}
                            style={{
                                // backgroundColor: "rgba(0, 0, 200, 0.5)",
                                backgroundColor: "transparent",
                                // backgroundColor: "white",
                                position: "absolute",
                                left: -4,
                                bottom: 0,
                                top: 7,
                                right: -10,
                                fontSize: 100,
                                // marginRight: -5,
                                verticalAlign: "bottom",
                                // lineHeight: 0.84,
                                outline: "none",
                                fontFamily: "Arial",
                                overflow: "hidden",
                                border: "none",
                                resize: "none"
                            }}
                            onInput={onTextChange}
                            value={props.text}
                        />
                    </div>
                </>
            } 
        </StyledLine>
    );
}
