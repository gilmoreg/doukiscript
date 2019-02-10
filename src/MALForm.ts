import { sleep } from "./Util";

export interface IMALForm {
    get(): Promise<void>
    priority: string
    storageType: string
    storageValue: string
    numRetailVolumes: string
    rewatchValue: string
    rereadValue: string
    comments: string
    discussionSetting: string
    SNSSetting: string
}

export class MALForm implements IMALForm {
    type: string
    id: number
    document: Document | null = null

    constructor(type: string, id: number) {
        this.type = type;
        this.id = id;
    }

    private fetchDocument(type: string, id: number): Promise<Document | null> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                return resolve(this.responseXML ? this.responseXML : null);
            }
            xhr.onerror = function (e) {
                reject(e);
            }
            xhr.open('GET', `https://myanimelist.net/ownlist/${type}/${id}/edit`);
            xhr.responseType = 'document';
            xhr.send();
        });
    }

    private getElement(id: string): HTMLSelectElement | null {
        if (!this.document) throw new Error('Document not loaded');
        return this.document.querySelector(`#add_${this.type}_${id}`) as HTMLSelectElement;
    }

    async get() {
        await sleep(500);
        const document = await this.fetchDocument(this.type, this.id);
        if (document) {
            this.document = document;
        } else {
            throw new Error('Unable to fetch form data');
        }
    }

    get priority(): string {
        const el = this.getElement('priority')
        if (!el) throw new Error('Unable to get priority');
        return el.value;
    }

    get storageType(): string {
        const el = this.getElement('storage_type')
        if (!el) throw new Error('Unable to get storage type');
        return el.value;
    }

    get storageValue(): string {
        const el = this.getElement('storage_value');
        if (!el) return '0';
        return el.value;
    }

    get numRetailVolumes(): string {
        const el = this.getElement('num_retail_volumes');
        if (!el) return '0';
        return el.value;
    }

    get rewatchValue(): string {
        const el = this.getElement('rewatch_value');
        if (!el) throw new Error('Unable to get rewatch value');
        return el.value;
    }

    get rereadValue(): string {
        const el = this.getElement('reread_value');
        if (!el) throw new Error('Unable to get reread value');
        return el.value;
    }

    get comments(): string {
        const el = this.getElement('comments');
        if (!el) throw new Error('Unable to get comments');
        return el.value;
    }

    get discussionSetting(): string {
        const el = this.getElement('is_asked_to_discuss');
        if (!el) throw new Error('Unable to get discussion value');
        return el.value;
    }

    get SNSSetting(): string {
        const el = this.getElement('sns_post_type');
        if (!el) throw new Error('Unable to get SNS setting');
        return el.value;
    }
}
