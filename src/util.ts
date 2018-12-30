export const sleep = (ms: number): Promise<null> => new Promise(resolve => setTimeout(() => resolve(), ms));
export const id = (str: string) => `#${str}`;