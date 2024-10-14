import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Tool } from "../types/Tool";
import { Point } from "../types/Point";
import { coGetTopCenterPoint } from "../types/CanvasObject";
import LineRender from "./LineRender";
import { Brush } from "../types/Brush";
import { Shape } from "../types/Shape";
import { ShapeType } from "../types/ShapeType";
import { CanvasObject } from "../types/CanvasObject";
import { CanvasAction } from "../types/CanvasAction";
import { Font } from "../types/Font";
import { Transform } from "../types/Transform";
import { CoSelection } from "../types/Selection";

// function radiansToDegrees(radians: number): number {
//     return radians * (180 / Math.PI);
// }

function getRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

function useGlobalKeydown(handler: (event: KeyboardEvent) => void) {
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      handler(event);
    };

    document.addEventListener("keydown", keydownListener);

    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [handler]); // Re-run the effect if the handler changes
}

interface CanvasProps {
    $backgroundColor: string;
}

const StyledCanvas = styled.canvas.attrs<CanvasProps>(props => ({
    style: {
        background: `${props.$backgroundColor}`
    }
}))`
    display: block;
    width: 100vw;
    height: 100vh;
    // width: 200px;
    // height: 200px;

    // height: 100vh;
    // height: 99%;
    // overflow: hidden;
    // box-sizing: border-box;
    // border: 1px solid black;

    // height: 50px;
    // height: 22px;
    // flex: 1;
    // display: block;
    // min-width: 0;
    // min-height: 0;
`;

interface Props {
    // The points that make up the curved line
    points: { x: number; y: number }[];
    // The thickness of the line at the beginning and end
    startThickness: number;
    endThickness: number;
    // The color of the line
    color: string;
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
	brushSettings: Brush;
    shapeSettings: Shape;
    fontSettings: Font;
    backgroundColor: string;
	historyIndex: number;
	setHistoryIndex: (index: number) => void;
	history: CanvasObject[][];
    setHistory: (history: CanvasObject[][]) => void;
}



export default function Canvas(props: Props) {
    //TODO: merge state vars with similar purpose into larger state vars to clean up code,
    //improve performance, and reduce memory consumption

    //TODO: use global variables where possible?

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [canvasAction, setCanvasAction] = useState<CanvasAction>(CanvasAction.none);

    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
    const [selectedCo, setSelectedCo] = useState<{
        index: number;
        points?: Point[];
    } | null>(null);

    // const [tempPoints, setTempPoints] = useState<Point[] | undefined>(undefined);

    const [selection, setSelection] = useState<CoSelection>({
        id: getRandomString(7),
        selectedObjects: []
    });

    const [mousePos, setMousePos] = useState<Point>({x: 0, y: 0});
    const [prevMousePos, setPrevMousePos] = useState<Point>({x: 0, y: 0});

    const [prescaleLineWidth, setPrescaleLineWidth] = useState<number>(0);
    const [prescaleLineHeight, setPrescaleLineHeight] = useState<number>(0);
    const [prescaleThickness, setPrescaleThickness] = useState<number>(0);
    const [prescalePoints, setPrescalePoints] = useState<Point[] | undefined>(undefined);

    const [premoveMousePos, setPremoveMousePos] = useState<Point | undefined>(undefined);

    const [testRotation, setTestRotation] = useState<number>(0);

    const [selectLastCo, setSelectLastCo] = useState<boolean>(false);

    const [influenceLineThicknessWithScaling, setInfluenceLineThicknessWithScaling] = useState<boolean>(true);
    const [multidirectionalScale, setMultidirectionalScale] = useState<boolean>(false);

    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const [selectionController, setSelectionController] = useState<CanvasObject | undefined>(undefined);

    const [isCreatingNewObject, setIsCreatingNewObject] = useState<boolean>(false);

    // const [tempCanvasObjects, setTempCanvasObjects] = useState<CanvasObject[]>([]);

    useEffect(() => {
        function handleResize() {
            console.log("window resized");
        
            const canvas = canvasRef.current;
            if (canvas)
                fitToParent(canvas);
        }
        
        const canvas = canvasRef.current;
        if (canvas)
            fitToParent(canvas);

        takeSnapshot();
        
        window.addEventListener("resize", handleResize, false);
        // window.addEventListener("keydown", handleKeyDown, false);
        
        return () => {
            window.removeEventListener("resize", handleResize);
            // window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    useGlobalKeydown((e) => {
        console.log("key down");
        if (e.key === "Delete") {
            console.log("delete pressed");
            // const newSelection = {...selection};
            const updatedCanvasObjects = [...canvasObjects];

            const coIndexes = selection.selectedObjects.map(co => co.index).sort((a, b) => b - a);
            console.log(coIndexes);
            console.log(canvasObjects);

            for (let i = 0; i < coIndexes.length; i++) {
                updatedCanvasObjects.splice(coIndexes[i], 1);
            }

            setCanvasObjects(updatedCanvasObjects);
            setSelection({
                ...selection,
                selectedObjects: []
            });

            setSelectionController(undefined);
            setIsCreatingNewObject(true);

            // //remove all selected objects from canvas objects
            // //remove all selected objects
            // setSelection(newSelection);
        }

    });

    useEffect(() => {
        const canvas = canvasRef.current

        if (canvas === null) {
            return;
        }

        const ctx = canvas.getContext("2d")

        if (ctx === null) {
            return;
        }

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // ctx.globalAlpha = lineOpacity
        ctx.strokeStyle = props.color;
        ctx.lineWidth = props.startThickness;
        // ctxRef.current = ctx;
        // resizeCanvasToDisplaySize(canvasRef.current);
    }, [props.points, props.startThickness, props.endThickness, props.color]);

    useEffect(() => {
        repaintCanvas();

        if (selectLastCo) {
            const [selcos, cos] = selectCo(canvasObjects.length - 1, selection, canvasObjects);

            setSelection(selcos);
            setCanvasObjects(cos);
            setSelectLastCo(false);
        }

        if (!isCreatingNewObject)
            return;
        setIsCreatingNewObject(false);

        console.log("taking snapshot...");
        takeSnapshot();
    }, [canvasObjects, isCreatingNewObject]);

    useEffect(() => {
        if (props.history.length === 0)
            return;

        // const [sel, _] = deselectCos(selection, canvasObjects)
        // setSelection(sel);

        const targetSnapshot = props.history[props.historyIndex].map(s => {
            s.isSelected = false
            return s;
        });

        setCanvasObjects(targetSnapshot);
    }, [props.historyIndex])

    // useEffect(() => {
    //     setCanvasObjects(tempCanvasObjects);
    // }, [tempCanvasObjects])

    function repaintCanvas() {
        const canvas = canvasRef.current;

        if (!canvas)
            return;

        const context = canvas.getContext("2d");

        if (!context)
            return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.lineCap = "round";
        context.lineJoin = "round";

        canvasObjects.forEach(co => {
            context.strokeStyle = co.brush.color;
            context.fillStyle = co.brush.color;
            context.lineWidth = co.brush.thickness;
            context.globalAlpha = co.brush.opacity;

            if (co.points && co.points.length > 0) {
                context.beginPath();
                context.moveTo(co.points[0].x, co.points[0].y);
                co.points.forEach(point => context.lineTo(point.x, point.y));
                context.stroke();
            }

            if (co.shape) {
                console.log("has shape");
                // if (isRotating) {
                //     context.translate(lineRectGetCenterPoint(co).x, lineRectGetCenterPoint(co).y);
                //     context.rotate(45);
                //     context.translate(-lineRectGetCenterPoint(co).x, -lineRectGetCenterPoint(co).y);
                // }

                console.log(co.shape.type);
                switch(co.shape.type) {
                case ShapeType.reactangle:
                    console.log("drawing rectangle...");
                    if (co.shape.isFilled) {
                        context.fillRect(co.transform.x, co.transform.y,
                            co.transform.width, co.transform.height);
                    } else {
                        context.strokeRect(co.transform.x, co.transform.y,
                            co.transform.width, co.transform.height);
                    }
                    break;
                case ShapeType.ellipse:
                    console.log("drawing circle...");
                    context.beginPath();
                    let radiusX = co.transform.width; // X-axis radius
                    let radiusY = co.transform.height; // Y-axis radius

                    if (radiusX < 0 || radiusY < 0)
                        return;

                    context.ellipse(co.transform.x, co.transform.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    co.shape.isFilled ? context.fill() : context.stroke();
                    break;
                case ShapeType.triangle:
                    context.beginPath();
                    context.moveTo(coGetTopCenterPoint(co).x, coGetTopCenterPoint(co).y);
                    context.lineTo(co.transform.x, co.transform.y + co.transform.height);
                    context.lineTo(co.transform.x + co.transform.width, co.transform.y + co.transform.height);
                    context.closePath();
                    co.shape.isFilled ? context.fill() : context.stroke();
                }
            }

            if (co.text) {
                context.font = `${co.fontSize}px Arial`;
                context.fillText(co.text, co.transform.x, co.transform.y + co.transform.height);
            }
        });

        // shapes.forEach(shape => {
        //     context.strokeStyle = shape.fill;
        //     context.fillStyle = shape.fill;
        //     context.globalAlpha = shape.opacity;
        //
        //     if (shape.isFilled) {
        //         context.fillRect(shape.transform.x, shape.transform.y,
        //             shape.transform.width, shape.transform.height);
        //     } else {
        //         context.strokeRect(shape.transform.x, shape.transform.y,
        //             shape.transform.width, shape.transform.height);
        //     }
        // });
    }

    function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        setPrevMousePos({x: e.clientX, y: e.clientY});
        console.log("mouse down");
        const { offsetX, offsetY } = e.nativeEvent;
        setInfluenceLineThicknessWithScaling(true);
        setIsMouseDown(true);

        switch (props.selectedTool) {
        case Tool.brush:
            setIsDrawing(true);
            setCanvasAction(CanvasAction.draw);
            console.log("start draw brush");

            const newCanvasObjects = [...canvasObjects, new CanvasObject({
                points: [{ x: offsetX, y: offsetY }],
                brush: {...props.brushSettings},
                transform: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    rotation: 0
                },
                isSelected: false
            })];

            // tempCanvasObjects = newCanvasObjects;
            // setTempCanvasObjects(newCanvasObjects);
            setCanvasObjects(newCanvasObjects);
            setIsCreatingNewObject(true);
            break;
        case Tool.transform: {
            if (e.shiftKey)
                return;

            const [sel, cos] = deselectCos(selection, canvasObjects);
            setSelection(sel);
            setCanvasObjects(cos);
            setSelectionController(undefined);
            console.log("deselecting...");
            break;
        }
        case Tool.shape: {
            const newCo = new CanvasObject({
                transform: {
                    x: offsetX,
                    y: offsetY,
                    width: 100,
                    height: 100,
                    rotation: 0
                },
                brush: {...props.brushSettings},
                shape: {...props.shapeSettings},
                isSelected: false
            });

            let [sel, cos] = deselectCos(selection, canvasObjects);
            cos.push(newCo);
            [sel, cos] = selectCo(cos.length - 1, sel, cos);

            const selCtrl = new CanvasObject({
                transform: getSelectionBoundingBox(sel.selectedObjects),
                brush: { color: "#000000", thickness: 0, opacity: 0},
                isSelected: false
            });

            console.log("sel ctrl height: ", selCtrl.transform.height);
            selCtrl.preActionCo = selCtrl.clone();

            setSelectionController(selCtrl);
            setSelection(sel);
            setCanvasObjects(cos);

            preparePreTransformationVariables(e, newCo);
            setSelectLastCo(true);
            setInfluenceLineThicknessWithScaling(false);
            setCanvasAction(CanvasAction.scale);
            setIsCreatingNewObject(true);
            // props.setSelectedTool(Tool.transform);

            // setCanvasObjects(prevCos => {
            //     const updatedCos = [...prevCos];
            //
            //     console.log(props.shapeSettings);
            //
            //     updatedCos.push(newCo);
            //
            //     preparePreTransformationVariables(e, newCo);
            //     setSelectLastCo(true);
            //     setInfluenceLineThicknessWithScaling(false);
            //     setCanvasAction(CanvasAction.scale);
            //     // props.setSelectedTool(Tool.transform);
            //
            //
            //     setSelectedCanvasObjects(prevSelCos => {
            //         const updatedSelCos = [...prevSelCos];
            //
            //         updatedSelCos.push({
            //             index: updatedCos.length - 1,
            //             co: newCo.clone()
            //         });
            //
            //         const selCtrl = new CanvasObject({
            //             transform: getSelectionBoundingBox(updatedSelCos),
            //             brush: { color: "#000000", thickness: 0, opacity: 0},
            //             isSelected: false
            //         });
            //
            //         console.log("sel ctrl height: ", selCtrl.transform.height);
            //         selCtrl.preActionCo = selCtrl.clone();
            //
            //         setSelectionController(selCtrl);
            //
            //         return updatedSelCos;
            //     });
            //
            //     return updatedCos;
            // });
            break;
        }
        case Tool.text:
            const newTextString = "new text";

            setCanvasObjects([...canvasObjects, new CanvasObject({
                transform: {
                    x: offsetX,
                    y: offsetY,
                    width: getTextMetrics(
                        newTextString,
                        `${props.fontSettings.fontSize}px ${props.fontSettings.fontFamily}`
                    )!.width,
                    height: props.fontSettings.fontSize,
                    rotation: 0
                },
                brush: {...props.brushSettings},
                text: newTextString,
                fontSize: props.fontSettings.fontSize,
                isSelected: false
            })]);

            // props.setSelectedTool(Tool.transform);
            setSelectLastCo(true);
            setIsCreatingNewObject(true);
            break;
        }
    }

    function onMouseUp() {
        setIsDrawing(false);
        setTestRotation(0);
        setIsMouseDown(false);
        setMultidirectionalScale(false);


        if (canvasAction === CanvasAction.none &&
            selection.selectedObjects.length > 0) {
            const selCtrl = new CanvasObject({
                transform: getSelectionBoundingBox(selection.selectedObjects),
                brush: { color: "#000000", thickness: 0, opacity: 0},
                isSelected: false
            });

            console.log("sel ctrl height: ", selCtrl.transform.height);
            selCtrl.preActionCo = selCtrl.clone();
            setSelectionController(selCtrl);
        }

        setCanvasObjects(prevCos => {
            if (canvasObjects.length === 0)
                return prevCos;

            console.log("updating rect...");

            const lastCoIndex = canvasObjects.length - 1;
            let updatedCos = [...prevCos];

            if (updatedCos[lastCoIndex].isGhost)
                updatedCos = updatedCos.slice(0, -1);
            else
                updateSelectionRect(updatedCos[lastCoIndex]);


            return updatedCos;
        });

        // setSelectedCo(null);
        setCanvasAction(CanvasAction.none);

        setSelection(_ => {
            const updatedSelection = {
                ...selection,
                selectedObjects: [...selection.selectedObjects]
            }
            for (let i = 0; i < updatedSelection.selectedObjects.length; i++) {
                const objClone = canvasObjects[updatedSelection.selectedObjects[i].index].clone();
                updatedSelection.selectedObjects[i] = {
                    index: updatedSelection.selectedObjects[i].index,
                    selectionId: selection.id,
                    co: objClone,
                };
            }

            return updatedSelection;
        });
    }

    function onMouseMove(e: React.MouseEvent) {
        const { offsetX, offsetY } = e.nativeEvent;
        setMousePos({x: e.clientX, y: e.clientY});

        const newCos = [...canvasObjects];


        switch (canvasAction) {
        case CanvasAction.draw: {
            if (!isDrawing)
                return;

            const lastCo = newCos[newCos.length - 1];

            if (lastCo.points === undefined)
                return;

            lastCo.points = [...lastCo.points, { x: offsetX, y: offsetY }];
            setCanvasObjects(newCos);
            console.log("drawing");
            break;
        }
        case CanvasAction.move: {
            console.log("move init");
            if (selectedCo === null)
                return;

            // if (canvasObjects.length === 0)
            //     return;

            if (!premoveMousePos)
                return;

            // if (selectedCanvasObjects.length === 0)
            //     return;

            // const deltaX = mousePos.x - prevMousePos.x;
            // const deltaY = mousePos.y - prevMousePos.y;

            const deltaX = mousePos.x - premoveMousePos.x;
            const deltaY = mousePos.y - premoveMousePos.y;

            moveSelectionWithMouse(deltaX, deltaY, newCos);

            // moveCanvasObject(newCos[selectedCo.index], deltaX, deltaY);
            console.log("tempCanvasObjects: ");
            // console.log(tempCanvasObjects);
            console.log("selectedCanvasObjects: ");
            console.log(selection);
            //TODO: move by setting, instead of additively (this might be the root of the problem!)
            //NOTE: might need to store some sort of initial positions for the points
            // moveCanvasObject(tempCanvasObjects[selectedCo.index], deltaX, deltaY, selectedCanvasObjects[selectedCo.index]);


            // setSelectedCo({ ...selectedCo, points: newCos[selectedCo.index].points });
            // setCanvasObjects(newCos);
            setCanvasObjects([...newCos]);
            // setTempCanvasObjects(newCos);
            console.log("dragging");
            break;
        }
        case CanvasAction.rotate: {
            if (selectedCo === null)
                return;

            for (let i = 0; i < selection.selectedObjects.length; i++) {
                // const origin = coGetCenterPoint(canvasObjects[selectedCo.index]);
                const selectionBoundingBox = getSelectionBoundingBox(selection.selectedObjects);

                const origin = {
                    x: selectionBoundingBox.x + selectionBoundingBox.width / 2,
                    y: selectionBoundingBox.y + selectionBoundingBox.height / 2
                }

                const angleDegrees = mousePos.x - prevMousePos.x;

                // rotateCanvasObject(tempCanvasObjects[selectedCanvasObjects[i].index],
                //     angleDegrees, origin, testRotation, setTestRotation);

                newCos[selection.selectedObjects[i].index]
                    .rotate(angleDegrees, origin, testRotation, setTestRotation);
            }


            setCanvasObjects([...newCos]);
            console.log("rotating");
            break;
        }
        case CanvasAction.scale: {
            if (selectedCo === null)
                return;

            let newMultidirectionalScale = multidirectionalScale;

            if (e.shiftKey) {
                newMultidirectionalScale = true;
            } else {
                newMultidirectionalScale = false;
            }

            scaleSelectionBoundingBoxWithMouse(canvasObjects, newMultidirectionalScale);
            // updateSelectionRect(newCos[selectedCo.index]);
            setCanvasObjects(newCos);
            setMultidirectionalScale(newMultidirectionalScale);
            console.log("scaling");
            break;
        }
        case CanvasAction.none: {
            if (!isMouseDown)
                return;

            const lastCo = canvasObjects[canvasObjects.length - 1];
            console.log("lc: " + lastCo);

            if (lastCo === undefined || !lastCo.isGhost) {
                const newSelectionRect = new CanvasObject({
                    transform: {
                        x: offsetX,
                        y: offsetY,
                        width: 1,
                        height: 1,
                        rotation: 0
                    },
                    brush: {
                        color: "#808080",
                        thickness: 1,
                        opacity: 1
                    },
                    shape: {
                        type: ShapeType.reactangle,
                        isFilled: false
                    },
                    isSelected: false,
                    isGhost: true
                });

                newCos.push(newSelectionRect);
                console.log("slajf");
                setCanvasObjects(newCos);
                preparePreTransformationVariables(e, newSelectionRect);
                setMultidirectionalScale(true);
                setInfluenceLineThicknessWithScaling(false);
                const newSelection = {
                    ...selection,
                    id: getRandomString(7)
                }
                setSelection(newSelection);
                return;
            }

            scaleCanvasObjectWithMouse(lastCo);
            setCanvasObjects(newCos);

            let updatedSelection = selection;
            let cos = newCos;

            for (let i = 0; i < canvasObjects.length; i++) {
                if (canvasObjects[i].isGhost)
                    continue;

                const selectedCo = updatedSelection.selectedObjects.find(co => co.index === i);

                if (selectedCo) {
                    if (isCoInSelection(canvasObjects[i], lastCo.transform)) {
                        [updatedSelection, cos] = selectCo(i, updatedSelection, cos);
                    } else if (selectedCo.selectionId === updatedSelection.id) {
                        [updatedSelection, cos] = deselectCo(i, updatedSelection, cos);
                    }
                // }
                } else if (isCoInSelection(canvasObjects[i], lastCo.transform)) {
                    // console.log("flafn");
                    [updatedSelection, cos] = selectCo(i, updatedSelection, cos);
                }

            }

            if (updatedSelection !== undefined)
                setSelection(updatedSelection);

            if (cos !== undefined) {
                setCanvasObjects(cos);
            }

            console.log(canvasObjects[canvasObjects.length - 1]);
            console.log("is drawing selection rect...");
            console.log(canvasObjects);
            break;
        }
        }

        //TODO: clean up? (these two lines are also executed somewhere else)
        setPrevMousePos({x: mousePos.x, y: mousePos.y});
    }

    function preparePreTransformationVariables(e: React.MouseEvent, co: CanvasObject) {
        setPrevMousePos({x: e.clientX, y: e.clientY});
        setPrescaleLineWidth(co.transform.width);
        setPrescaleLineHeight(co.transform.height);
        setPrescaleThickness(co.brush.thickness);
        setPrescalePoints(co.points);
    }

    function selectCo(index: number, selection: Readonly<CoSelection>,
        canvasObjects: Readonly<CanvasObject[]>): [CoSelection, CanvasObject[]] {
        // if (props.selectedTool !== Tool.transform && props.selectedTool !== Tool.text)
        //     return;

        // setSelectedCo({
        //     index: canvasObjects.length - 1,
        //     points: canvasObjects[index].points
        // });
        //
        // setSelectedCanvasObjects(prevSelectedCanvasObjects => {
        //     const updatedCanvasObjects = [...prevSelectedCanvasObjects];
        //
        //     for (let i = 0; i < updatedCanvasObjects.length; i++) {
        //         const objClone = canvasObjects[updatedCanvasObjects[i].index].clone();
        //         updatedCanvasObjects[i] = {
        //             index: updatedCanvasObjects[i].index,
        //             co: objClone,
        //         };
        //     }
        //
        //     // if (existingCanvasObject) {
        //     //     return prevSelectedCanvasObjects.map(co => 
        //     //         co.index === index ? { ...newCanvasObject } : co)
        //     // } else {
        //     //     return [...prevSelectedCanvasObjects, newCanvasObject];
        //     // }
        //
        //     const hasIndex = updatedCanvasObjects.some(co => co.index === index);
        //     console.log("has index: " + hasIndex);
        //     if (!hasIndex) {
        //         updatedCanvasObjects.push({index, co: canvasObjects[index].clone()});
        //         console.log("has index: adding new...");
        //     }
        //
        //     return updatedCanvasObjects;
        // });
        //
        // setCanvasObjects(prevCos => {
        //     // const updatedCos = prevCos.map(co => ({
        //     //     ...co,
        //     //     isSelected: false
        //     // }));
        //
        //     const updatedCos = [...prevCos];
        //
        //     updatedCos[index].isSelected = true;
        //
        //     // const line = updatedCos.splice(index, 1)[0];
        //     // line.isSelected = true;
        //     // updatedCos.push(line);
        //
        //     tempCanvasObjects = updatedCos;
        //     // setTempCanvasObjects(updatedCos);
        //     console.log(tempCanvasObjects);
        //
        //     return updatedCos;
        // });

        setSelectedCo({
            index: canvasObjects.length - 1,
            points: canvasObjects[index].points
        });


        const updatedSelection = {
            ...selection,
            selectedObjects: [...selection.selectedObjects]
        }

        for (let i = 0; i < updatedSelection.selectedObjects.length; i++) {
            const objClone = canvasObjects[updatedSelection.selectedObjects[i].index].clone();
            updatedSelection.selectedObjects[i] = {
                index: updatedSelection.selectedObjects[i].index,
                selectionId: updatedSelection.selectedObjects[i].selectionId,
                co: objClone
            };
        }

        // if (existingCanvasObject) {
        //     return prevSelectedCanvasObjects.map(co => 
        //         co.index === index ? { ...newCanvasObject } : co)
        // } else {
        //     return [...prevSelectedCanvasObjects, newCanvasObject];
        // }

        const hasIndex = updatedSelection.selectedObjects.some(co => co.index === index);
        console.log("has index: " + hasIndex);
        if (!hasIndex) {
            updatedSelection.selectedObjects.push({
                index,
                selectionId: selection.id,
                co: canvasObjects[index].clone()
            });
            console.log("has index: adding new...");
        }

        const updatedCanvasObjects = [...canvasObjects];

        // const updatedCos = prevCos.map(co => ({
        //     ...co,
        //     isSelected: false
        // }));


        updatedCanvasObjects[index].isSelected = true;

        // const line = updatedCos.splice(index, 1)[0];
        // line.isSelected = true;
        // updatedCos.push(line);

        console.log("selecting...");
        return [updatedSelection, updatedCanvasObjects];
    }

    function deselectCo(index: number, selection: Readonly<CoSelection>,
        canvasObjects: Readonly<CanvasObject[]>): [CoSelection, CanvasObject[]]  {

        const updatedSelection = {
            ...selection,
            selectedObjects: [...selection.selectedObjects]
        }

        const filteredSelCos =
            selection.selectedObjects.filter((_, i) => i !== index);

        updatedSelection.selectedObjects = filteredSelCos;

        return [
            updatedSelection,
            canvasObjects.map((co, i) => {
                if (i === index) {
                    // const updatedCo = co.clone();
                    // updatedCo.isSelected = false;
                    // return updatedCo;

                    co.isSelected = false;
                    return co;
                }

                return co;
            })
        ];
    }

    function deselectCos(selection: Readonly<CoSelection>, canvasObjects: Readonly<CanvasObject[]>): [CoSelection, CanvasObject[]]  {

        return [
            {
                ...selection,
                selectedObjects: []
            },
            canvasObjects.map(co => {
                co.isSelected = false;
                return co;
            })
        ];
    }

    // function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    //   const width = canvas.clientWidth;
    //   const height = canvas.clientHeight;
    //   if (canvas.width !== width || canvas.height !== height) {
    //     canvas.width = width;
    //     canvas.height = height;
    //     console.log("changing size...")
    //   }
    // }

    function fitToParent(element: HTMLCanvasElement) {
        // element.width = 0;
        // element.height = 0;
        // element.width = 200;
        // element.height = 200;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = element.width;
        tempCanvas.height = element.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.drawImage(element, 0, 0);
        
        element.width = window.innerWidth;
        element.height = window.innerHeight;
        
        const ctx = element.getContext('2d');
        ctx?.drawImage(tempCanvas, 0, 0);
    }

    function getHighestPointY(points: Point[]): number {
        return points.reduce((max, point) => point.y > max ? point.y : max, points[0].y);
    }

    function getLowestPointY(points: Point[]): number {
        return points.reduce((min, point) => point.y < min ? point.y : min, points[0].y);
    }

    function getLeftMostPointX(points: Point[]): number {
        return points.reduce((min, point) => point.x < min ? point.x : min, points[0].x);
    }

    function getRightMostPointX(points: Point[]): number {
        return points.reduce((max, point) => point.x > max ? point.x : max, points[0].x);
    }

    function updateSelectionRect(co: CanvasObject) {
        if (co.points === undefined)
            return;

        if (co.points.length === 0)
            return;

        // console.log("co points: ", co.points);

        co.transform.width =
            getRightMostPointX(co.points) - getLeftMostPointX(co.points);
        co.transform.height =
            getHighestPointY(co.points) - getLowestPointY(co.points);

        co.transform.y = getLowestPointY(co.points);
        co.transform.x = getLeftMostPointX(co.points);
    }

    function isCoSelected(co: CanvasObject): boolean {
        // return props.selectedTool === Tool.transform && co.isSelected;
        return (props.selectedTool === Tool.transform || props.selectedTool === Tool.text) && co.isSelected;
    }

    function onScaleBegin(e: React.MouseEvent) {
        if (!selectedCo)
            return;

        if (selectionController) {
            const newSelCtrl = selectionController.clone();
            newSelCtrl.transform = getSelectionBoundingBox(selection.selectedObjects);
            newSelCtrl.preActionCo = newSelCtrl.clone();
            setSelectionController(newSelCtrl);
        }

        setPremoveMousePos({x: e.clientX, y: e.clientY});

        // setInfluenceLineThicknessWithScaling(true);
        // 
        setCanvasAction(CanvasAction.scale);
    }

    // function onScaleBeginSelRect(e: React.MouseEvent) {
    //     setInfluenceLineThicknessWithScaling(true);
    //
    //     const selBoundingBox = getSelectionBoundingBox();
    //     // preparePreTransformationVariables(e, {
    //     //     transform: selBoundingBox,
    //     //     brush: {
    //     //         color: "white",
    //     //         thickness: 2,
    //     //         opacity: 1
    //     //     },
    //     //     isSelected: false
    //     // });
    //
    //     setCanvasAction(CanvasAction.scale);
    // }

    function onScaleEnd() {
        // setCanvasAction(CanvasAction.none);
        // selectionController_handleMouseDown(e);
        onMouseUp();
    }

    function onRotateBegin(e: React.MouseEvent) {
        if (!selectedCo)
            return;

        setPrevMousePos({x: e.clientX, y: e.clientY});
        // preparePreTransformationVariables(e, canvasObjects[selectedCo?.index]);
        setCanvasAction(CanvasAction.rotate);
    }

    function onRotateEnd() {
        setCanvasAction(CanvasAction.none);
    }

    function lineRender_handleOnMouseDown(i: number, e: React.MouseEvent<HTMLDivElement>) {
        // preparePreTransformationVariables(e, canvasObjects[i]);
        setPremoveMousePos({x: e.clientX, y: e.clientY});

        let updatedSelection = selection;
        let cos = canvasObjects;

        if (!e.shiftKey)
            [updatedSelection, cos] = deselectCos(selection, canvasObjects);

        [updatedSelection, cos] = selectCo(i, updatedSelection, cos);

        setCanvasAction(CanvasAction.move);


        const selCtrl = new CanvasObject({
            transform: getSelectionBoundingBox(updatedSelection.selectedObjects),
            brush: { color: "#000000", thickness: 0, opacity: 0},
            isSelected: false
        });

        console.log("sel ctrl height: ", selCtrl.transform.height);
        selCtrl.preActionCo = selCtrl.clone();

        setSelectionController(selCtrl);
        setSelection(updatedSelection);
        setCanvasObjects(cos);
        console.log("canvas objects >>");
        console.log(cos);


        // if (selectionController) {
        //     const newSelCtrl = selectionController.clone();
        //     newSelCtrl.transform = getSelectionBoundingBox();
        //     setSelectionController(newSelCtrl);
        // }

    }

    function selectionController_handleMouseDown(e: React.MouseEvent<HTMLElement>) {
        if (selectionController) {
            const newSelCtrl = selectionController.clone();
            newSelCtrl.transform = getSelectionBoundingBox(selection.selectedObjects);
            newSelCtrl.preActionCo = newSelCtrl.clone();
            setSelectionController(newSelCtrl);
        }

        setPremoveMousePos({x: e.clientX, y: e.clientY});

        setCanvasAction(CanvasAction.move);
    }

    function onTextChange(newText: string) {
        if (!selectedCo)
            return;

        setCanvasObjects(prevCos => {
            const updatedCos = [...prevCos];

            updatedCos[selectedCo.index].text = newText;

            return updatedCos;
        });
    }

    function getTextMetrics(text: string, font: string): TextMetrics | undefined {
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");

        if (!ctx)
            return undefined;

        ctx.font = font || getComputedStyle(document.body).font;
        return ctx?.measureText(text);
    }

    function moveSelectionWithMouse(mouseDeltaX: number, mouseDeltaY: number, canvasObjects: CanvasObject[]) {
        if (!selectionController || !selectionController.preActionCo)
            return;

        console.log("moving selection with mouse...");

        const tempSelectionController = new CanvasObject({
            transform: selectionController.transform,
            brush: selectionController.brush,
            isSelected: selectionController.isSelected,
            preActionCo: selectionController.preActionCo
        });

        tempSelectionController.move(mouseDeltaX, mouseDeltaY, tempSelectionController.preActionCo!);

        for (let i = 0; i < selection.selectedObjects.length; i++) {
            const co = canvasObjects[selection.selectedObjects[i].index];

            // co.transform.x = co.preActionCo.transform.x + deltaX;
            // co.transform.y = co.preActionCo.transform.y + deltaY;

            co.move(mouseDeltaX, mouseDeltaY, selection.selectedObjects[i].co);

            // moveCanvasObject(tempCanvasObjects[selectedCanvasObjects[i].index],
            //     deltaX, deltaY, selectedCanvasObjects[i]);
            // console.log(selectedCo.index);
            // console.log("sel can obj: ", selectedCanvasObjects[i]);
        }
    }

    function scaleSelectionBoundingBoxWithMouse(canvasObjects: CanvasObject[], multidirectionalScale: boolean) {
        if (!selectionController || !selectionController.preActionCo)
            return;

        const tempSelectionController = new CanvasObject({
            transform: selectionController.transform,
            brush: selectionController.brush,
            isSelected: selectionController.isSelected,
            preActionCo: selectionController.preActionCo
        });

        const transformOrigin = { x: tempSelectionController.transform.x, y: tempSelectionController.transform.y };

        const scaleFactorX = (mousePos.x - transformOrigin.x) / tempSelectionController.preActionCo!.transform.width;
        const scaleFactorY = (mousePos.y - transformOrigin.y) / tempSelectionController.preActionCo!.transform.height;

        console.log("preactionco: ", tempSelectionController.preActionCo!.transform.height);
        console.log("scale factorX: ", scaleFactorX)
        console.log("scale factorY: ", scaleFactorY)
        console.log("currentco: ", tempSelectionController.transform.height);


		tempSelectionController.transform.width = tempSelectionController.preActionCo!.transform.width * scaleFactorX;

        if (multidirectionalScale)
            tempSelectionController.transform.height = tempSelectionController.preActionCo!.transform.height * scaleFactorX;
        else
            tempSelectionController.transform.height = tempSelectionController.preActionCo!.transform.height * scaleFactorY;

        setSelectionController(tempSelectionController);

        for (let i = 0; i < selection.selectedObjects.length; i++) {
            const selObj = canvasObjects[selection.selectedObjects[i].index];

            // if (!selObj.preActionCo)
            //     selObj.preActionCo = selObj.clone();
        
            const deltaX = (selection.selectedObjects[i].co.transform.x - transformOrigin.x) * scaleFactorX;
            const deltaY = (selection.selectedObjects[i].co.transform.y - transformOrigin.y) * scaleFactorX;
            console.log("rect transform: ", selection.selectedObjects[i].co.transform);

            selObj.transform.x = deltaX + transformOrigin.x;
            selObj.transform.y = deltaY + transformOrigin.y;
            // selObj.move(deltaX, deltaY, selectedCanvasObjects[i].co);
            console.log("X: ", selection.selectedObjects[i].co.transform.x);
            console.log("Y: ", selection.selectedObjects[i].co.transform.y);
            selObj.transform.width = selection.selectedObjects[i].co.transform.width * scaleFactorX;

            if (multidirectionalScale)
                selObj.transform.height = selection.selectedObjects[i].co.transform.height * scaleFactorX;
            else
                selObj.transform.height = selection.selectedObjects[i].co.transform.height * scaleFactorY;

            // console.log("preactioncolog: ", selObj.preActionCo);
            console.log("prevsel: ", selection.selectedObjects[i]);
        
            // selObj.recalculatePositionOfPoints(deltaX, deltaY);
            selObj.recalculateScaleOfPoints(scaleFactorX, transformOrigin, selection.selectedObjects[i].co.points);
            // updateSelectionRect(selObj);
        }
    }

    function scaleCanvasObjectWithMouse(co: CanvasObject) {
        const transformOrigin = { x: co.transform.x, y: co.transform.y };

        const scaleFactorX = (mousePos.x - transformOrigin.x) / prescaleLineWidth;
        const scaleFactorY = (mousePos.y - transformOrigin.y) / prescaleLineHeight;


        // scaleCanvasObject(co, scaleFactorX, scaleFactorY, transformOrigin,
        //     influenceLineThicknessWithScaling, multidirectionalScale, prescalePoints, prescaleThickness,
        //     prescaleLineWidth, prescaleLineHeight);

        co.scale(scaleFactorX, scaleFactorY, transformOrigin,
            influenceLineThicknessWithScaling, multidirectionalScale, prescalePoints, prescaleThickness,
            prescaleLineWidth, prescaleLineHeight);

        // if (!influenceLineThicknessWithScaling)
        //     return;
        //
        // const selectionRect = co;
        //
        // for (let i = 0; i < selectedCanvasObjects.length; i++) {
        //     const selObj = tempCanvasObjects[selectedCanvasObjects[i].index];
        //
        //     const deltaX = selectionRect.transform.x + (selObj.transform.x - selectionRect.transform.x) * scaleFactorX;
        //     const deltaY = selectionRect.transform.y + (selObj.transform.y - selectionRect.transform.y) * scaleFactorY;
        //     selObj.transform.x = deltaX;
        //     selObj.transform.y = deltaY;
        //     selObj.transform.width = selObj.transform.width * scaleFactorX;
        //     selObj.transform.height = selObj.transform.height * scaleFactorY;
        //
        //     selObj.recalculatePositionOfPoints(deltaX, deltaY);
        //     selObj.recalculateScaleOfPoints(scaleFactorX, scaleFactorY, transformOrigin, selectedCanvasObjects[i].points);
        // }
    }

    // function scaleSelectionWithMouse(selectionRect: Transform) {
        // scale selection rect according to mouse movement (need to store initial state) 
        // update selected objects' scale and position according to the selection rect (can be 1 or more)
        // we MIGHT be able to calculate the objects's inital x and y based on the initial selection rect state (???)
        // update the state (setCanvasObjects(tempCanvasObjects))

        // this should be the only way to scale objects (always including the selection rect)
        // also applies for moving and rotating - selection rect is the controller 

        // also need to figure out the naming

        // all this means is that much of the code has to be re-done.
    // }

    function isCoInSelection(co: CanvasObject, selectionTransform: Transform): boolean {
        const selectionTransformNormalized = normalizeRect(selectionTransform);
        console.log("selection rectangle: ", selectionTransformNormalized);

        return !(
            co.transform.x + co.transform.width < selectionTransformNormalized.x ||
                co.transform.x > selectionTransformNormalized.x + selectionTransformNormalized.width ||
                co.transform.y + co.transform.height < selectionTransformNormalized.y ||
                co.transform.y > selectionTransformNormalized.y + selectionTransformNormalized.height
        );
        // const xIsIn = co.transform.x >= selectionTransform.x && co.transform.x <= selectionTransform.x + selectionTransform.width;
        // const yIsIn = co.transform.y >= selectionTransform.y && co.transform.y <= selectionTransform.y + selectionTransform.height;
        // const widthIsIn = 
        //
        // return xIsIn && yIsIn;
    }

    function getSelectionBoundingBox(selectedCanvasObjects: ({co: CanvasObject} & {index: number})[]): Transform {
        let leastX = Number.MAX_SAFE_INTEGER;
        let leastY = Number.MAX_SAFE_INTEGER;
        let mostX = Number.MIN_SAFE_INTEGER;
        let mostY = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < selectedCanvasObjects.length; i++) {
            if (selectedCanvasObjects[i].co.transform.x <  leastX)
                leastX = selectedCanvasObjects[i].co.transform.x;
            if (selectedCanvasObjects[i].co.transform.y < leastY)
                leastY = selectedCanvasObjects[i].co.transform.y;
            if (selectedCanvasObjects[i].co.transform.x + selectedCanvasObjects[i].co.transform.width > mostX)
                mostX = selectedCanvasObjects[i].co.transform.x + selectedCanvasObjects[i].co.transform.width;
            if (selectedCanvasObjects[i].co.transform.y + selectedCanvasObjects[i].co.transform.height > mostY)
                mostY = selectedCanvasObjects[i].co.transform.y + selectedCanvasObjects[i].co.transform.height;
        }

        return {
            x: leastX,
            y: leastY,
            width: mostX - leastX,
            height: mostY - leastY,
            rotation: 0
        };
    }

    function normalizeRect(rect: Transform): Transform {
        let normalizedX = rect.x;
        let normalizedY = rect.y;
        let normalizedWidth = rect.width;
        let normalizedHeight = rect.height;

        if (rect.width < 0) {
            normalizedX = rect.x + rect.width; // Move x to the left
            normalizedWidth = Math.abs(rect.width); // Make width positive
        }

        if (rect.height < 0) {
            normalizedY = rect.y + rect.height; // Move y up
            normalizedHeight = Math.abs(rect.height); // Make height positive
        }

        return {
            x: normalizedX,
            y: normalizedY,
            width: normalizedWidth,
            height: normalizedHeight,
            rotation: rect.rotation
        };
    }

    function takeSnapshot() {
        const updatedHistory = [...props.history];
        updatedHistory.splice(props.historyIndex + 1);
        updatedHistory.push(canvasObjects.map(co => co.clone()));
        props.setHistory(updatedHistory);
        props.setHistoryIndex(updatedHistory.length - 1);
    }

    return (
        <div
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <StyledCanvas
                ref={canvasRef}
                // width={400}
                // height={400}
                onMouseDown={onMouseDown}
                $backgroundColor={props.backgroundColor}
                // onKeyDown={handleKeyDown}
                // tabIndex={-1}
            />
            <button onClick={takeSnapshot}>take snapshot</button>

            {(props.selectedTool === Tool.transform || props.selectedTool === Tool.text) && canvasObjects.map((co, i) => (
                <LineRender
                    key={i}
                    //better alternative?
                    onMouseDown={(e) => lineRender_handleOnMouseDown(i, e)}
                    onScaleBegin={onScaleBegin}
                    onScaleEnd={onScaleEnd}
                    onRotateBegin={onRotateBegin}
                    onRotateEnd={onRotateEnd}
                    isSelected={isCoSelected(co)}
                    left={co.transform.x}
                    top={co.transform.y}
                    width={co.transform.width}
                    height={co.transform.height}
                    rotation={testRotation}
                    text={co.text}
                    setText={onTextChange}
                    fontSize={co.fontSize}
                    isController={false}
                />
            ))}

            {selectionController &&
                <LineRender
                    //better alternative?
                    onMouseDown={(e) => selectionController_handleMouseDown(e)}
                    onScaleBegin={onScaleBegin}
                    onScaleEnd={onScaleEnd}
                    onRotateBegin={onRotateBegin}
                    onRotateEnd={onRotateEnd}
                    isSelected={true}
                    left={selectionController.transform.x}
                    top={selectionController.transform.y}
                    width={selectionController.transform.width}
                    height={selectionController.transform.height}
                    rotation={testRotation}
                    text={undefined}
                    setText={onTextChange}
                    fontSize={undefined}
                    isController={true}
                />
            }
        </div> 
    );
}

