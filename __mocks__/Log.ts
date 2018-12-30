export const clear = () => console.log('clearing console');
export const error = (msg: string) => console.log('logging error', msg);
export const info = (msg: string) => console.log('logging info', msg);
export const addCountLog = (op: string, type: string, max: number) => console.log('creating count log for', op, type, max);
export const updateCountLog = (op: string, type: string, ct: number) => console.log('updating count log for', op, type, ct);