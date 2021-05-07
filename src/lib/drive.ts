import { Interfaces } from "@youwol/flux-files"
import { Observable, Subject } from "rxjs"
import { map, tap } from "rxjs/operators"
import { AssetsGatewayClient, DeletedEntityResponse, ItemResponse } from "./assets-gateway-client"


export class File extends Interfaces.File {

    constructor(public readonly drive: Drive, public readonly metadata: ItemResponse){
        super(metadata.treeId, metadata.name, metadata.folderId, drive, "")
    }
}
export class Drive extends Interfaces.Drive {

    rawIds: { [key: string]: string } = {} // known treeId (itemId) to rawId

    constructor(id: string, name: string, useCache?: boolean
    ) {
        super(id, name, useCache)

    }

    createFile(
        folderId: string,
        name: string,
        content: Blob,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Interfaces.File> {

        return AssetsGatewayClient.postFile( folderId, name, content, events$ || this.events$).pipe(
            map(resp => new Interfaces.File(resp.itemId, resp.name, folderId, this, ""))
        )
    }

    createFolder(
        parentFolderId: string,
        name: string,
        events$: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>> = undefined
    ): Observable<Interfaces.Folder> {

        return AssetsGatewayClient.postFolder({ name, parentFolderId }, events$ || this.events$).pipe(
            map(resp => new Interfaces.Folder(resp.folderId, resp.name, resp.parentFolderId, this))
        )
    }

    deleteFolder(
        folderId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
        ): Observable<DeletedEntityResponse> {

        return AssetsGatewayClient.deleteFolder(folderId, events$ || this.events$)
    }

    renameItem(
        item: Interfaces.File | Interfaces.Folder | Interfaces.Drive,
        newName: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Interfaces.File | Interfaces.Folder | Interfaces.Drive> {

        if (item instanceof Interfaces.File)
            return AssetsGatewayClient.renameItem(item.id, newName, events$ || this.events$).pipe(
                map(resp => new Interfaces.File(item.id, newName, item.parentFolderId, this, item.contentType))
            )

        if (item instanceof Interfaces.Folder)
            return AssetsGatewayClient.renameFolder(item.id, newName, events$ || this.events$).pipe(
                map(resp => new Interfaces.Folder(item.id, newName, item.parentFolderId, this))
            )

        if (item instanceof Interfaces.Drive)
            return AssetsGatewayClient.renameDrive(this.id, newName, events$ || this.events$).pipe(
                map(resp => new Drive(item.id, newName))
            )
    }

    blob(
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Blob> {

        if (!this.rawIds[itemId])
            throw Error(`Drive's cache do not contains rawId for ${itemId}`)
        return AssetsGatewayClient.getContent(this.rawIds[itemId], events$ || this.events$, this.useCache)
    }

    getFile(
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Interfaces.File> {

        return AssetsGatewayClient.getItem(itemId, events$ || this.events$).pipe(
            tap((resp) => this.rawIds[itemId] = resp.rawId),
            map((resp) => {
                return new Interfaces.File(itemId, resp.name, resp.folderId, this, "")
            })
        )
    }

    listItems(
        folderId: string,
        maxResults: number = 100,
        beginIterator?: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<{ folders: Array<Interfaces.Folder>, files: Array<Interfaces.File>, endIterator: string | undefined }> {

        return AssetsGatewayClient.getItems(folderId, events$ || this.events$).pipe(
            tap(({ items, folders }) => items.forEach(item => this.rawIds[item.treeId] = item.rawId)),
            map(({ items, folders }) => {
                return {
                    files: items.map(item => new File(this, item) ),
                    folders: folders.map(item => new Interfaces.Folder(item.folderId, item.name, item.parentFolderId, this)),
                    endIterator: undefined
                }
            })
        )
    }

    deleteFile(
        fileId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<DeletedEntityResponse> {
        
        return AssetsGatewayClient.deleteItem(this.id, fileId, events$ || this.events$)
    }

    updateContent(
        fileId: string,
        content: Blob,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<{ itemId: string, name: string, folderId: string }> {

        return AssetsGatewayClient.updateFile(this.id, fileId, content, events$ || this.events$)
    }

    getPermissions() {

    }
}