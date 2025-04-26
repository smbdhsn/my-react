import { ReactElement } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { React_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

function ChildReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElement
	) {
		// 根据element创建fiber
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		// 首屏渲染 & 应该追踪副作用
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement
	) {
		// 判断当前fiber类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case React_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
					break;
			}
		}
		// TODO: 多节点的情况 ul > li3
		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (__DEV__) {
			console.warn('未实现的类型');
		}

		return null;
	};
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
