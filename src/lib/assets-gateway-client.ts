import { createObservableFromFetch } from '@youwol/flux-core';
import { Observable, Subject } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Interfaces } from '@youwol/flux-files'

export interface DriveResponse {

    driveId: string
    name: string
}

export interface FolderResponse {

    folderId: string
    parentFolderId: string
    name: string
    driveId: string
    created: string
}

export interface ItemResponse {

    name: string
    treeId: string
    rawId: string
    assetId: string
    groupId: string
    kind: string
    folderId: string
    borrowed: boolean
}

export const UploadStep = {
    START: 'start',
    SENDING: 'sending',
    PROCESSING: 'processing',
    FINISHED: 'finished'
}

export class ProgressMessage {

    fileName: string
    step: string
    percentSent: number
    constructor({ fileName, step, percentSent }: { fileName: string, step: string, percentSent: number }) {
        this.fileName = fileName
        this.step = step
        this.percentSent = percentSent
    }
}

export class EntityNotFoundByName extends Error{

    constructor(
        public readonly entityName: string, 
        ...params) {

        super(...params)
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, EntityNotFoundByName);
          }
        this.name = 'GroupNotFound';
    }
}

export class DeletedEntityResponse {

    type: string
    author: string
    driveId: string
    entityId: string
    timestamp: string

    constructor({ driveId, type, author, entityId, timestamp }:
        { driveId: string, type: string, author: string, entityId: string, timestamp: string }) {
        this.driveId = driveId
        this.type = type
        this.author = author
        this.entityId = entityId
        this.timestamp = timestamp
    }
}

export class AssetsGatewayClient {

    static basePath = "/api/assets-gateway"


    constructor() { }

    static getHeaders() {
        return new Headers()
    }

    static getGroups(events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
        ): Observable<GroupResponse>{
        
        let follower = new Interfaces.RequestFollower({
            targetId: `getGroups`,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.QUERY
        })
        
        let requestGroups = new Request(
            `${AssetsGatewayClient.basePath}/groups`,
            { method: 'GET', headers: AssetsGatewayClient.getHeaders() }
        );
        return of({}).pipe(
            tap( () => follower.start(1) ), 
            mergeMap( () => createObservableFromFetch(requestGroups)),
            tap(() => follower.end()) 
        ) as any
    }

    static getDrive(
        groupName: string,
        driveName: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<DriveResponse> {

        let requestGroups = new Request(
            `${AssetsGatewayClient.basePath}/groups`,
            { method: 'GET', headers: AssetsGatewayClient.getHeaders() }
        );

        let follower = new Interfaces.RequestFollower({
            targetId: `${groupName}/${driveName}`,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.DOWNLOAD
        })
        follower.start(1)

        return createObservableFromFetch(requestGroups).pipe(
            map((resp: any) => {
                return resp.groups.find(g => g.path == groupName)
            }),
            tap((grp) => {
                if (!grp)
                    throw new EntityNotFoundByName(groupName, `Can not find the group ${groupName} in user's groups list`)
            }),
            mergeMap((group: any) => {
                let req = new Request(
                    `${AssetsGatewayClient.basePath}/tree/groups/${group.id}/drives`, 
                    { method: 'GET', headers: AssetsGatewayClient.getHeaders() }
                );
                return createObservableFromFetch(req)
            }),
            map((resp: {drives: Array<DriveResponse>}) => {
                let drive = resp.drives.find(d => d.name == driveName)
                if(drive){
                    return drive
                }
                throw new EntityNotFoundByName(driveName, `Drive '${driveName}' not found`)
            }),
            tap(() => follower.end())
        )
    }

    static postDrive(
        { name, groupId }: { name: string, groupId: string },
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<DriveResponse> {

        let url = `${AssetsGatewayClient.basePath}/tree/groups/${groupId}/drives`
        let request = new Request(url, { method: 'PUT', body: JSON.stringify({ name }), headers: AssetsGatewayClient.getHeaders() });

        let follower = new Interfaces.RequestFollower({
            targetId: groupId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.UPLOAD
        })
        follower.start(1)

        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }

    static postFolder(
        { name, parentFolderId }: { name: string, parentFolderId: string },
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<FolderResponse> {

        let url = `${AssetsGatewayClient.basePath}/tree/folders/${parentFolderId}`
        let request = new Request(url, { method: 'PUT', body: JSON.stringify({ name }), headers: AssetsGatewayClient.getHeaders() });

        let follower = new Interfaces.RequestFollower({
            targetId: parentFolderId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.UPLOAD
        })
        follower.start(1)
        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }

    static deleteFolder(
        folderId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<DeletedEntityResponse> {

        let url = `${AssetsGatewayClient.basePath}/tree/folders/${folderId}`
        let request = new Request(url, { method: 'DELETE', headers: AssetsGatewayClient.getHeaders() });
        let follower = new Interfaces.RequestFollower({
            targetId: folderId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.DELETE
        })
        follower.start()

        return createObservableFromFetch(request).pipe(
            map((resp: any) => new DeletedEntityResponse(resp)),
            tap(() => follower.end())
        )
    }

    static renameItem(
        itemId: string,
        newName: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<ItemResponse> {

        let url = `${AssetsGatewayClient.basePath}/assets/${itemId}`

        let follower = new Interfaces.RequestFollower({
            targetId: itemId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.UPLOAD
        })
        follower.start()
        let request = new Request(url, { method: 'POST', body: JSON.stringify({ name: newName }), headers: AssetsGatewayClient.getHeaders() })

        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }

    static renameFolder(
        itemId: string,
        newName: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>):
        Observable<any> {

        let url = `${AssetsGatewayClient.basePath}/tree/folders/${itemId}`
        let request = new Request(url, { method: 'POST', body: JSON.stringify({ name: newName }), headers: AssetsGatewayClient.getHeaders() })
        let follower = new Interfaces.RequestFollower({
            targetId: itemId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.UPLOAD
        })
        follower.start()
        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }

    static renameDrive(
        driveId: string,
        newName: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<any> {

        let url = `${AssetsGatewayClient.basePath}/tree/drives/${driveId}`
        let request = new Request(url, { method: 'POST', body: JSON.stringify({ name: newName }), headers: AssetsGatewayClient.getHeaders() })

        let follower = new Interfaces.RequestFollower({
            targetId: driveId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.UPLOAD
        })
        follower.start()

        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }

    static deleteItem(
        driveId: string,
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<DeletedEntityResponse> {

        let url = `${AssetsGatewayClient.basePath}/tree/${itemId}`
        let request = new Request(url, { method: 'DELETE', headers: AssetsGatewayClient.getHeaders() });

        let follower = new Interfaces.RequestFollower({
            targetId: driveId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.DELETE
        })
        follower.start()

        return createObservableFromFetch(request).pipe(
            map((resp: any) => new DeletedEntityResponse(resp)),
            tap(() => follower.end())
        )
    }

    static postFile(
        folderId: string,
        fileName: string,
        blob: Blob,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<{ itemId: string, name: string, folderId: string }> {

        return Interfaces.uploadBlob(
            `${AssetsGatewayClient.basePath}/assets/data/location/${folderId}`, 
            fileName, blob, {}, undefined, events$
            ).pipe(
                map(resp => ({ itemId: resp.itemId, name: resp.name, folderId: resp.folderId })
            )
        )
    }

    static updateFile(
        driveId: string,
        fileId: string,
        blob: Blob,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<{ itemId: string, name: string, folderId: string }> {

        return Interfaces.uploadBlob(
            `${AssetsGatewayClient.basePath}/drives/${driveId}/files/${fileId}`, 
            "name does not matter", blob, {}, fileId, events$
            ).pipe(
                map( resp => ({itemId: resp.itemId, name: resp.name, folderId: resp.folderId})
            )
        )
    }

    static getContent(
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>,
        useCache = true
    ): Observable<Blob> {
        
        return Interfaces.downloadBlob(
            `${AssetsGatewayClient.basePath}/raw/data/${itemId}`,
            itemId, {}, events$, undefined, useCache)
    }

    static getItem(
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>,
    ): Observable<ItemResponse> {

        let url = `${AssetsGatewayClient.basePath}/tree/items/${itemId}`
        let request = new Request(url, { method: 'GET', headers: AssetsGatewayClient.getHeaders() });

        let follower = new Interfaces.RequestFollower({
            targetId: itemId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.DOWNLOAD
        })
        follower.start()

        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }

    static getItems(
        folderId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<{ folders: Array<FolderResponse>, items: Array<ItemResponse> }> {

        let url = `${AssetsGatewayClient.basePath}/tree/folders/${folderId}/children`
        let request = new Request(url, { method: 'GET', headers: AssetsGatewayClient.getHeaders() });

        let follower = new Interfaces.RequestFollower({
            targetId: folderId,
            channels$: events$ ? events$ : [],
            method: Interfaces.Method.DOWNLOAD
        })
        follower.start()

        return createObservableFromFetch(request).pipe(
            tap(() => follower.end())
        )
    }
}