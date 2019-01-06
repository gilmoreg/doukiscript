import { fetchDocument } from "./util";
import Dom, { IDomMethods } from "./Dom";
import { IMALForm, createMALForm } from "./MALForm";
import Log, { ILog } from "./Log";

export interface IDIContainer {
    fetchDocument: (type: string, id: number) => Promise<Document | null>
    malFormFactory: (type: string, id: number) => IMALForm
    dom: IDomMethods
    log: ILog
}

export class DIContainer implements IDIContainer {
    fetchDocument: (type: string, id: number) => Promise<Document | null>;
    malFormFactory: (type: string, id: number) => IMALForm;
    dom: IDomMethods;
    log: ILog;

    constructor(
        fetchDocumentFn: (type: string, id: number) => Promise<Document | null> = fetchDocument,
        malFormFactory: (type: string, id: number) => IMALForm = createMALForm,
        dom: IDomMethods = Dom,
        log: ILog = Log
    ) {
        this.fetchDocument = fetchDocumentFn;
        this.malFormFactory = malFormFactory;
        this.dom = dom;
        this.log = log;
    }
}

export const diContainer = new DIContainer();