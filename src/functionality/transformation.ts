import { CanvasObject } from "../types/CanvasObject";
import { Point } from "../types/Point";
import { Transform } from "../types/Transform";

export function moveCanvasObject(co: CanvasObject, deltaX: number, deltaY: number, preMoveCo: CanvasObject) {
	if (co.points && preMoveCo.points) {
		co.points = preMoveCo.points.map(point => ({
			x: point.x + deltaX,
			y: point.y + deltaY
		}));
	}

	//todo: update whole tranform object instead
	co.transform.x = preMoveCo.transform.x + deltaX;
	co.transform.y = preMoveCo.transform.y + deltaY;
	console.log("called");

	updateDimensions(co);
}

export function rotateCanvasObject(co: CanvasObject, angleDegrees: number, origin: Point,
	testRotation: number, setTestRotation: (r: number) => void) {
	setTestRotation(testRotation + angleDegrees);

	const angleRadians = (Math.PI / 180) * angleDegrees;
	const cos = Math.cos(angleRadians);
	const sin = Math.sin(angleRadians);

	if (co.points) {
		co.points = co.points.map(point => {
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

export function scaleCanvasObject(
	co: CanvasObject,
	scaleFactorX: number,
	scaleFactorY: number,
	origin: Point,
	influenceLineThicknessWithScaling: boolean,
	multidirectionalScale: boolean,
	prescalePoints: Point[] | undefined,
	prescaleThickness: number,
	prescaleLineWidth: number, // TODO: rename
	prescaleLineHeight: number // TODO: rename
) {
	if (co.points && prescalePoints) {
		//TODO: fix
		co.points = prescalePoints.map(point => ({
			x: (point.x - origin.x) * scaleFactorX + origin.x,
			y: (point.y - origin.y) * scaleFactorX + origin.y
		}));
	}

	if (influenceLineThicknessWithScaling)
		co.brush.thickness = prescaleThickness * scaleFactorX;

	co.transform.width = prescaleLineWidth * scaleFactorX;

	if (multidirectionalScale)
		co.transform.height = prescaleLineHeight * scaleFactorY;
	else
		co.transform.height = prescaleLineHeight * scaleFactorX;
}

function updateDimensions(co: CanvasObject) {
	if (co.points === undefined)
		return;

	co.transform.width =
		getRightMostPointX(co.points) - getLeftMostPointX(co.points);
	co.transform.height =
		getHighestPointY(co.points) - getLowestPointY(co.points);

	co.transform.y = getLowestPointY(co.points);
	co.transform.x = getLeftMostPointX(co.points);
}

export function getHighestPointY(points: Point[]): number {
	return points.reduce((max, point) => point.y > max ? point.y : max, points[0].y);
}

export function getLowestPointY(points: Point[]): number {
	return points.reduce((min, point) => point.y < min ? point.y : min, points[0].y);
}

export function getLeftMostPointX(points: Point[]): number {
	return points.reduce((min, point) => point.x < min ? point.x : min, points[0].x);
}

export function getRightMostPointX(points: Point[]): number {
	return points.reduce((max, point) => point.x > max ? point.x : max, points[0].x);
}
