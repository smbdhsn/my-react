const supportSymbol = typeof Symbol === 'function' && Symbol;

export const React_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;
