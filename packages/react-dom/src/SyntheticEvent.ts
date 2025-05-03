import { Container } from 'hostConfig';
import {
	unstable_ImmediatePriority,
	unstable_NormalPriority,
	unstable_runWithPriority,
	unstable_UserBlockingPriority
} from 'scheduler';
import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props__';

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}

export function updateFiberProps(node: any, props: Props) {
	node[elementPropsKey] = props;
}

type EventCallback = (e: Event) => void;

interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

interface SyntheticEvnet extends Event {
	__stopPropagation: boolean;
}
// 支持的事件
const validEventTypeList = ['click'];

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn('当前不支持', eventType, '事件');
		return;
	}
	if (__DEV__) {
		console.log('初始化事件: ', eventType);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	/**
	 * 1.收集沿途事件
	 * 2.构造合成事件对象
	 * 3.遍历capture
	 * 4.遍历bubble
	 */
	const targetElement = e.target as DOMElement;

	if (targetElement == null) {
		console.warn('事件不存在target', e);
		return;
	}

	const { bubble, capture } = collectPaths(targetElement, container, eventType);
	const syntheticEvent = createSyntheticEvent(e);
	triggerEventFlow(capture, syntheticEvent);

	if (syntheticEvent.__stopPropagation) {
		return;
	}

	triggerEventFlow(bubble, syntheticEvent);
}

function getEventCallbackNameFromEventType(
	eventType: string
): string[] | undefined {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
}

function collectPaths(
	targetElement: DOMElement,
	container: Container,
	eventType: string
) {
	const paths: Paths = {
		bubble: [],
		capture: []
	};

	while (targetElement && targetElement !== container) {
		// 收集
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			// click -> onClick onClickCapture
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							paths.capture.unshift(eventCallback);
						} else {
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}
		targetElement = targetElement.parentNode as DOMElement;
	}

	return paths;
}

function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvnet;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;

	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		originStopPropagation();
	};

	return syntheticEvent;
}

export function triggerEventFlow(paths: EventCallback[], se: SyntheticEvnet) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		//不同事件在不同优先级上下文环境下执行
		unstable_runWithPriority(eventTypeToSchedulerPriority(se.type), () => {
			callback.call(null, se);
		});

		if (se.__stopPropagation) {
			break;
		}
	}
}

export function eventTypeToSchedulerPriority(eventType: string) {
	switch (eventType) {
		case 'click':
		case 'keydown':
		case 'keyup':
			return unstable_ImmediatePriority;
		case 'scroll':
			return unstable_UserBlockingPriority;
		default:
			return unstable_NormalPriority;
	}
}
