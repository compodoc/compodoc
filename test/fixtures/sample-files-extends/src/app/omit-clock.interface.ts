export interface OmitBaseInterface {
    prop1: string;
    prop2: boolean;
    propHidden: number;
}

export interface OmitClockInterface extends Omit<OmitBaseInterface, 'prop1' | 'propHidden'> {
    prop1: Date;
    prop3: string;
}
