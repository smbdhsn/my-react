import { Dispatcher, resolveDispatcher } from './src/currentDispatcher';
import { jsx } from './src/jsx';
import currentDispatcher from './src/currentDispatcher';

export const useState: Dispatcher['useState'] = (initialState: any) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED__ = {
	currentDispatcher
};

export default {
	version: '0.0.0',
	createElement: jsx,
	useState
};
