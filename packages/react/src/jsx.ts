import { React_ELEMENT_TYPE } from 'shared/ReactSymbols';
import type {
	Type,
	Key,
	Ref,
	Props,
	ReactElement,
	ElementType
} from 'shared/ReactTypes';
// ReactElement

const createReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElement {
	const element = {
		$$typeof: React_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'MT'
	};
	return element;
};

export const jsx = (type: ElementType, config: any, jsxKey: string) => {
	const key: Key = jsxKey || null;
	const props: Props = {};
	let ref: Ref = null;

	for (const prop in config) {
		const val = config[prop];
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		if (prop === 'children') {
			const children = config[prop];
			if (children) {
				props.children = children;
			}
			continue;
		}
		if (Object.prototype.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	return createReactElement(type, key, ref, props);
};

export const jsxDEV = jsx;
