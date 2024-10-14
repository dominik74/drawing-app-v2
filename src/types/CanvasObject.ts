import { getHighestPointY, getLeftMostPointX, getLowestPointY, getRightMostPointX } from "../functionality/transformation";
import { Brush } from "./Brush";
import { Point } from "./Point";
import { Shape } from "./Shape";
import { Transform } from "./Transform";

export interface CanvasObjectProps {
	transform: Transform;
	brush: Brush;
	isSelected: boolean;
	shape?: Shape;
	points?: Point[];
	text?: string;
	fontSize?: number;
	isGhost?: boolean;
	preActionCo?: CanvasObject;
}

export class CanvasObject {
	transform: Transform;
	brush: Brush;
	isSelected: boolean;
	shape?: Shape;
	points?: Point[];
	text?: string;
	fontSize?: number;
	isGhost?: boolean;
	preActionCo?: CanvasObject;

	constructor(coProps: CanvasObjectProps) {
		this.transform = coProps.transform;
		this.brush = coProps.brush;
		this.isSelected = coProps.isSelected;
		this.preActionCo = coProps.preActionCo;
		this.shape = coProps.shape;
		this.points = coProps.points;
		this.text = coProps.text;
		this.fontSize = coProps.fontSize;
		this.isGhost = coProps.isGhost;

		this.resizeBoundingBoxBasedOnPoints();
	}

	recalculatePositionOfPoints(deltaX: number, deltaY: number): void {
		// if (!this.points)
		// 	return;

		if (!this.preActionCo)
			return;

		if (!this.preActionCo.points)
			return;

		this.points = this.preActionCo.points.map(point => ({
			x: point.x + deltaX,
			y: point.y + deltaY
		}));
	}

	recalculateRotationOfPoints(origin: Point): void {
		if (!this.points)
			return;

		const angleRadians = (Math.PI / 180) * this.transform.rotation;
		const cos = Math.cos(angleRadians);
		const sin = Math.sin(angleRadians);

		this.points = this.points.map(point => {
			const translatedX = point.x - origin.x;
			const translatedY = point.y - origin.y;

			const rotatedX = translatedX * cos - translatedY * sin;
			const rotatedY = translatedX * sin + translatedY * cos;

			return {
				x: rotatedX + origin.x,
				y: rotatedY + origin.y
			}
		});
	}

	recalculateScaleOfPoints(scaleFactorX: number, origin: Point,
		prescalePoints?: Point[]): void {

		// if (!this.points)
		// 	return;

		if (!prescalePoints)
			return;

		this.points = prescalePoints.map(point => ({
			x: (point.x - origin.x) * scaleFactorX + origin.x,
			y: (point.y - origin.y) * scaleFactorX + origin.y
		}));
	}

	resizeBoundingBoxBasedOnPoints(): void {
		if (!this.points)
			return;

        if (this.points.length === 0)
            return;

		this.transform.width =
			getRightMostPointX(this.points) - getLeftMostPointX(this.points);
		this.transform.height =
			getHighestPointY(this.points) - getLowestPointY(this.points);

		this.transform.y = getLowestPointY(this.points);
		this.transform.x = getLeftMostPointX(this.points);
	}

	move(deltaX: number, deltaY: number, preMoveCo: CanvasObjectProps): void {
		if (this.points && preMoveCo.points) {
			this.points = preMoveCo.points.map(point => ({
				x: point.x + deltaX,
				y: point.y + deltaY
			}));
		}

		//todo: update whole tranform object instead
		this.transform.x = preMoveCo.transform.x + deltaX;
		this.transform.y = preMoveCo.transform.y + deltaY;

		this.resizeBoundingBoxBasedOnPoints();
	}

	rotate(angleDegrees: number, origin: Point,
		testRotation: number, setTestRotation: (r: number) => void): void {

		setTestRotation(testRotation + angleDegrees);

		const angleRadians = (Math.PI / 180) * angleDegrees;
		const cos = Math.cos(angleRadians);
		const sin = Math.sin(angleRadians);

		if (this.points) {
			this.points = this.points.map(point => {
				const translatedX = point.x - origin.x;
				const translatedY = point.y - origin.y;

				const rotatedX = translatedX * cos - translatedY * sin;
				const rotatedY = translatedX * sin + translatedY * cos;

				return {
					x: rotatedX + origin.x,
					y: rotatedY + origin.y
				}
			});
		}
	}

	scale(
		scaleFactorX: number,
		scaleFactorY: number,
		origin: Point,
		influenceLineThicknessWithScaling: boolean,
		multidirectionalScale: boolean,
		prescalePoints: Point[] | undefined,
		prescaleThickness: number,
		prescaleLineWidth: number, // TODO: rename
		prescaleLineHeight: number // TODO: rename
	): void {
		if (this.points && prescalePoints) {
			//TODO: fix
			this.points = prescalePoints.map(point => ({
				x: (point.x - origin.x) * scaleFactorX + origin.x,
				y: (point.y - origin.y) * scaleFactorX + origin.y
			}));
		}

		if (influenceLineThicknessWithScaling)
			this.brush.thickness = prescaleThickness * scaleFactorX;

		this.transform.width = prescaleLineWidth * scaleFactorX;

		if (multidirectionalScale)
			this.transform.height = prescaleLineHeight * scaleFactorY;
		else
			this.transform.height = prescaleLineHeight * scaleFactorX;
	}

	clone(): CanvasObject {
		return new CanvasObject({
			transform: {...this.transform},
			brush: {...this.brush},
			isSelected: this.isSelected,
			points: [...(this.points || [])],
			shape: this.shape ? {...this.shape} : undefined,
			text: this.text
			// preActionCo: this.preActionCo
		});
	}
}


export function coGetTopRightPoint(co: CanvasObject): Point {
    return { x: co.transform.x + co.transform.width, y: co.transform.y };
}

export function coGetTopCenterPoint(co: CanvasObject): Point {
    return { x: co.transform.x + co.transform.width / 2, y: co.transform.y };
}

export function coGetBottomRightPoint(co: CanvasObject): Point {
    return { x: co.transform.x + co.transform.width, y: co.transform.y + co.transform.height };
}

export function coGetCenterPoint(co: CanvasObject): Point {
    return { x: co.transform.x + co.transform.width / 2, y: co.transform.y + co.transform.height / 2 };
}
