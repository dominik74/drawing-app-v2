import { useState } from 'react'
import './App.css'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import { Tool } from './types/Tool'
import { Brush } from './types/Brush'
import { DEFAULT_BRUSH_COLOR, DEFAULT_BRUSH_OPACITY, DEFAULT_BRUSH_SIZE, DEFAULT_SELECTED_TOOL, DEFAULT_SHAPE_TYPE, DEFAULT_SHAPE_IS_FILLED, DEFAULT_FONT_SIZE_PX, DEFAULT_FONT, DEFAULT_DOCUMENT_BG_COLOR } from './constants'
import { Shape } from './types/Shape'
import { Font } from './types/Font'
import ToolPropertiesBar from './components/ToolPropertiesBar'
import UndoRedoBar from './components/UndoRedoBar'
import { CanvasObject } from './types/CanvasObject'
import HistoryWindow from './components/HistoryWindow'

const points = [
    { x: 100, y: 100 },
    { x: 120, y: 110 },
    { x: 140, y: 120 },
    { x: 160, y: 130 },
    { x: 180, y: 140 },
    { x: 200, y: 150 },
    { x: 220, y: 160 },
    { x: 240, y: 170 },
    { x: 260, y: 180 },
    { x: 280, y: 190 },
    { x: 300, y: 200 },
];

function App() {
    const [selectedTool, setSelectedTool] = useState<Tool>(DEFAULT_SELECTED_TOOL);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [history, setHistory] = useState<CanvasObject[][]>([]);
    const [documentBackgroundColor, setDocumentBackgroundColor] = useState<string>(DEFAULT_DOCUMENT_BG_COLOR);
    const [isHistoryWindowVisible, setIsHistoryWindowVisible] = useState<boolean>(false);

    const [brushSettings, setBrushSettings] = useState<Brush>({
        color: DEFAULT_BRUSH_COLOR,
        thickness: DEFAULT_BRUSH_SIZE,
        opacity: DEFAULT_BRUSH_OPACITY
    });

    const [shapeSettings, setShapeSettings] = useState<Shape>({
        type: DEFAULT_SHAPE_TYPE,
        isFilled: DEFAULT_SHAPE_IS_FILLED
    });

    const [fontSettings, setFontSettings] = useState<Font>({
        fontFamily: DEFAULT_FONT,
        fontSize: DEFAULT_FONT_SIZE_PX
    });

    return (
        <>
            <Canvas
                points={points}
                startThickness={2}
                endThickness={10}
                color='#000'
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                brushSettings={brushSettings}
                shapeSettings={shapeSettings}
                fontSettings={fontSettings}
                backgroundColor={documentBackgroundColor}
                historyIndex={historyIndex}
                setHistoryIndex={setHistoryIndex}
                history={history}
                setHistory={setHistory}
            />

            <Toolbar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
            />

            <ToolPropertiesBar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                brushSettings={brushSettings}
                setBrushSettings={setBrushSettings}
                shapeSettings={shapeSettings}
                setShapeSettings={setShapeSettings}
                fontSettings={fontSettings}
                setFontSettings={setFontSettings}
                documentBackgroundColor={documentBackgroundColor}
                setDocumentBackgroundColor={setDocumentBackgroundColor}
            />

            <UndoRedoBar
                historyIndex={historyIndex}
                setHistoryIndex={setHistoryIndex}
                history={history}
                setIsHistoryVisible={setIsHistoryWindowVisible}
            />

            {isHistoryWindowVisible &&
                <HistoryWindow
                    onClose={() => setIsHistoryWindowVisible(false)}
                    history={history}
                />
            }
        </>
    )
}

export default App
