export enum UploadPhase {
    EMPTY,
    PREVIEW,
    UPLOADED
}

export type Media = {
    id: number,
    type: string,
    path: string
}