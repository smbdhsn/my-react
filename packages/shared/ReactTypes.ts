export type Type = any;
export type Key = any;
export type Props = any;
export type ElementType = any;
export type Ref = { current: any } | ((instance: any) => void);

export interface ReactElement {
	$$typeof: symbol | number;
	key: KeyboardEvent;
	type: ElementType;
	props: Props;
	ref: Ref;
	__mark: string;
}

export type Action<State> = State | ((preState: State) => State);
