import { ILog } from "../../src/Log";

export default class FakeLog implements ILog {
    clear() {
        console.log('clearing console');
    }
    error(msg: string) {
        console.log('logging error', msg);
    }
    info(msg: string) {
        console.log('logging info', msg);
    }
    debug(msg: string) {
        console.debug('logging debug', msg);
    }
    addCountLog(op: string, type: string, max: number) {
        console.log('creating count log for', op, type, max);
    }
    updateCountLog(op: string, type: string, ct: number) {
        console.log('updating count log for', op, type, ct);
    }
}





