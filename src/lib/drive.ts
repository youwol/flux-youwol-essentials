import { Interfaces } from "@youwol/flux-files"
import { Observable, Subject } from "rxjs"
import { map, tap } from "rxjs/operators"
import { DeletedEntityResponse, ItemResponse, AssetsGatewayClient } from "@youwol/platform-essentials"


export class File extends Interfaces.File {

    constructor(public readonly drive: Drive, public readonly metadata: ItemResponse) {
        super(metadata.treeId, metadata.name, metadata.folderId, drive, "")
    }
}
export class Drive extends Interfaces.Drive {

    rawIds: { [key: string]: string } = {} // known treeId (itemId) to rawId
    public readonly assetsGtwClient: AssetsGatewayClient

    constructor(
        id: string,
        name: string,
        assetsGtwClient: AssetsGatewayClient,
        useCache?: boolean
    ) {
        super(id, name, useCache)
        this.assetsGtwClient = assetsGtwClient
    }

    createFile(
        folderId: string,
        name: string,
        content: Blob,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Interfaces.File> {

        return this.assetsGtwClient.postFile(folderId, name, content, events$ || this.events$).pipe(
            map(resp => new Interfaces.File(resp.itemId, resp.name, folderId, this, ""))
        )
    }

    createFolder(
        parentFolderId: string,
        name: string,
        events$: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>> = undefined
    ): Observable<Interfaces.Folder> {

        return this.assetsGtwClient.postFolder({ name, parentFolderId }, events$ || this.events$).pipe(
            map(resp => new Interfaces.Folder(resp.folderId, resp.name, resp.parentFolderId, this))
        )
    }

    deleteFolder(
        folderId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<DeletedEntityResponse> {

        return this.assetsGtwClient.deleteFolder(folderId, events$ || this.events$)
    }

    renameItem(
        item: Interfaces.File | Interfaces.Folder | Interfaces.Drive,
        newName: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Interfaces.File | Interfaces.Folder | Interfaces.Drive> {

        if (item instanceof Interfaces.File)
            return this.assetsGtwClient.renameItem(item.id, newName, events$ || this.events$).pipe(
                map(resp => new Interfaces.File(item.id, newName, item.parentFolderId, this, item.contentType))
            )

        if (item instanceof Interfaces.Folder)
            return this.assetsGtwClient.renameFolder(item.id, newName, events$ || this.events$).pipe(
                map(resp => new Interfaces.Folder(item.id, newName, item.parentFolderId, this))
            )

        if (item instanceof Interfaces.Drive)
            return this.assetsGtwClient.renameDrive(this.id, newName, events$ || this.events$).pipe(
                map(resp => new Drive(item.id, newName, this.assetsGtwClient, this.useCache))
            )
    }

    blob(
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Blob> {

        if (!this.rawIds[itemId])
            throw Error(`Drive's cache do not contains rawId for ${itemId}`)
        return this.assetsGtwClient.getContent(this.rawIds[itemId], events$ || this.events$, this.useCache)
    }

    getFile(
        itemId: string,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<Interfaces.File> {

        return this.assetsGtwClient.getItem(itemId, events$ || this.events$).pipe(
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

        return this.assetsGtwClient.getItems(folderId, events$ || this.events$).pipe(
            tap(({ items, folders }) => items.forEach(item => this.rawIds[item.treeId] = item.rawId)),
            map(({ items, folders }) => {
                return {
                    files: items.map(item => new File(this, item)),
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

        return this.assetsGtwClient.deleteItem(this.id, fileId, events$ || this.events$)
    }

    updateContent(
        fileId: string,
        content: Blob,
        events$?: Subject<Interfaces.Event> | Array<Subject<Interfaces.Event>>
    ): Observable<{ itemId: string, name: string, folderId: string }> {

        return this.assetsGtwClient.updateFile(this.id, fileId, content, events$ || this.events$)
    }

    getPermissions() {

    }
}
