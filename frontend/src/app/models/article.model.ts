import { Descriptor } from './descriptor.model';
import { Annotator } from './annotator.model';

export interface Article {
    id?: string,
    title?: string,
    abstractText?: string,
    addedBy?: Annotator['id'],
    descriptors?: Descriptor[]
}
