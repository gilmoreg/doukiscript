import { IMALForm } from '../src/MALForm';

export type FakeFormData = {
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

const defaultFakeFormData: FakeFormData = {
    priority: '0',
    storageType: '0',
    storageValue: '0',
    numRetailVolumes: '0',
    rewatchValue: '0',
    rereadValue: '0',
    comments: 'comments',
    discussionSetting: '0',
    SNSSetting: '0'
}

export class FakeMALForm implements IMALForm {
    _priority: string
    _storageType: string
    _storageValue: string
    _numRetailVolumes: string
    _rewatchValue: string
    _rereadValue: string
    _comments: string
    _discussionSetting: string
    _SNSSetting: string

    constructor(data: FakeFormData = defaultFakeFormData) {
        this._priority = data.priority;
        this._storageType = data.storageType;
        this._storageValue = data.storageValue;
        this._numRetailVolumes = data.numRetailVolumes;
        this._rewatchValue = data.rewatchValue;
        this._rereadValue = data.rereadValue;
        this._comments = data.comments;
        this._discussionSetting = data.discussionSetting;
        this._SNSSetting = data.SNSSetting;
    }

    get(): Promise<void> {
        return Promise.resolve();
    }
    get priority(): string {
        return this._priority;
    }
    get storageType(): string {
        return this._storageType;
    }
    get storageValue(): string {
        return this._storageValue;
    }
    get numRetailVolumes(): string {
        return this._numRetailVolumes;
    }
    get rewatchValue(): string {
        return this._rewatchValue;
    }
    get rereadValue(): string {
        return this._rereadValue;
    }
    get comments(): string {
        return this._comments;
    }
    get discussionSetting(): string {
        return this._discussionSetting;
    }
    get SNSSetting(): string {
        return this._SNSSetting;
    }
}