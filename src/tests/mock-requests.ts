
class MockRequest {

    constructor(public readonly url: string, public readonly option: any) {
    }
}


export class XHRMock {

    static responseText: string
    static readyState: number
    static status: number
    static statusText: string

    responseText: string
    readyState: number
    status: number
    statusText: string

    method: string
    static url: string
    response: any

    static headers = {}
    onload: (Event) => void
    onloadstart: (Event) => void
    onprogress: (Event) => void
    upload = {
        onprogress: undefined
    }
    open(method, url) {
        this.method = method
        XHRMock.url = url
    }
    send() {
        this.onloadstart({ loaded: 0, total: 5 })
        if (this.method == "GET") {
            this.onprogress({ loaded: 1, total: 5 })
            this.onprogress({ loaded: 4, total: 5 })
            this.onprogress({ loaded: 5, total: 5 })
        }
        if (this.method == "POST") {
            this.upload.onprogress({ loaded: 1, total: 5 })
            this.upload.onprogress({ loaded: 4, total: 5 })
            this.upload.onprogress({ loaded: 5, total: 5 })
        }
        this.responseText = XHRMock.responseText
        this.status = XHRMock.status
        this.statusText = XHRMock.statusText
        this.readyState = XHRMock.readyState
        this.response = new Blob([this.responseText])
        this.onload({ loaded: 5, total: 5 })
    }
    setRequestHeader(k, v) {
        XHRMock.headers[k] = v
    }
}

let requestGroup = {
    url: "/api/assets-gateway/groups",
    option: {
        method: "GET",
        headers: {
        },
    },
}
let requestDrives = {
    url: "/api/assets-gateway/tree/groups/test_group/drives",
    option: {
        method: "GET",
        headers: {
        },
    },
}
let requestPostDrive = {
    url: "/api/assets-gateway/tree/groups//youwol-users/test_group/drives",
    option: {
        method: "PUT",
        body: "{\"name\":\"test_post_drive\"}",
        headers: {
        },
    },
}
let requestPostDriveError = {
    url: "/api/assets-gateway/tree/groups//youwol-users/error_group/drives",
    option: {
        method: "PUT",
        body: "{\"name\":\"test_post_drive\"}",
        headers: {
        },
    },
}
let requestPostFolder = {
    url: "/api/assets-gateway/tree/folders/parent_folder",
    option: {
        method: "PUT",
        body: "{\"name\":\"test_post_folder\"}",
        headers: {
        },
    },
}
let requestPostFolderError = {
    url: "/api/assets-gateway/tree/folders/error_parent_folder",
    option: {
        method: "PUT",
        body: "{\"name\":\"test_post_drive\"}",
        headers: {
        },
    },
}
let requestDeleteFolder = {
    url: "/api/assets-gateway/tree/folders/test_folder",
    option: {
        method: "DELETE",
        headers: {
        },
    },
}
let requestRenameItem = {
    url: "/api/assets-gateway/assets/test_item",
    option: {
        method: "POST",
        body: "{\"name\":\"test_item_new_name\"}",
        headers: {
        },
    },
}
let requestRenameFolder = {
    url: "/api/assets-gateway/tree/folders/test_folder",
    option: {
        method: "POST",
        body: "{\"name\":\"test_folder_new_name\"}",
        headers: {
        },
    },
}
let requestRenameDrive = {
    url: "/api/assets-gateway/tree/drives/test_drive",
    option: {
        method: "POST",
        body: "{\"name\":\"test_drive_new_name\"}",
        headers: {
        },
    },
}
let requestDeleteItem = {
    url: "/api/assets-gateway/tree/items/test_item",
    option: {
        method: "DELETE",
        headers: {
        },
    },
}
let requestGetItem = {
    url: "/api/assets-gateway/tree/items/item_treeId",
    option: {
        method: "GET",
        headers: {
        },
    },
}
let requestGetItems = {
    url: "/api/assets-gateway/tree/folders/folder_tree_id/children",
    option: {
        method: "GET",
        headers: {
        },
    },
}

let mappings = {
    [JSON.stringify(requestGroup)]: () => ({
        "groups": [{
            id: 'test_group',
            path: '/youwol-users/test_group'
        }]
    }),
    [JSON.stringify(requestDrives)]: () => ({
        "drives": [{
            driveId: 'test_drive',
            name: 'Test drive'
        }]
    }),
    [JSON.stringify(requestPostDrive)]: () => ({
        driveId: 'test_drive_post',
        name: 'test drive posted'
    }),
    [JSON.stringify(requestPostDriveError)]: () => { throw Error() },
    [JSON.stringify(requestPostFolder)]: () => ({
        folderId: 'test_post_folder',
        parentFolderId: 'parent_folder',
        name: 'test_post_folder',
        driveId: 'test_drive',
        created: 'whenever'
    }),
    [JSON.stringify(requestPostFolderError)]: () => { throw Error() },
    [JSON.stringify(requestDeleteFolder)]: () => ({
        type: "folder",
        author: "greinisch@youwol.com",
        driveId: "test_drive",
        entityId: "test_folder",
        timestamp: "whenever"
    }),
    [JSON.stringify(requestRenameItem)]: () => ({
        name: 'test_item_new_name',
        treeId: "item_treeId",
        rawId: "item_rawId",
        assetId: "item_assetId",
        groupId: "item_groupId",
        kind: "item_kind",
        folderId: "folder"
    }),
    [JSON.stringify(requestRenameFolder)]: () => ({
        name: 'test_folder_new_name',
        treeId: "folder_treeId",
        rawId: "folder_rawId",
        assetId: "folder_assetId",
        groupId: "folder_groupId",
        kind: "folder_kind",
        folderId: "test_folder"
    }),
    [JSON.stringify(requestRenameDrive)]: () => ({
        name: 'test_drive_new_name',
        treeId: "drive_treeId",
        rawId: "drive_rawId",
        assetId: "drive_assetId",
        groupId: "drive_groupId",
        kind: "drive_kind",
        folderId: "test_drive"
    }),
    [JSON.stringify(requestDeleteItem)]: () => ({
        type: "item",
        author: "greinisch@youwol.com",
        driveId: "test_drive",
        entityId: "test_item",
        timestamp: "whenever"
    }),
    [JSON.stringify(requestGetItem)]: () => ({
        name: 'test item',
        treeId: "item_treeId",
        rawId: "item_rawId",
        assetId: "item_assetId",
        groupId: "item_groupId",
        kind: "item_kind",
        folderId: "folder"
    }),
    [JSON.stringify(requestGetItems)]: () => ({
        folders: [{
            folderId: "test_folder",
            parentFolderId: "test_drive",
            name: "test folder",
            driveId: "test_drive",
            created: "whenever"
        }],
        items: [{
            name: 'test item',
            treeId: "item_treeId",
            rawId: "item_rawId",
            assetId: "item_assetId",
            groupId: "item_groupId",
            kind: "item_kind",
            folderId: "folder"
        }]
    }),
}

function mockFetch(request: MockRequest) {

    return new Promise((resolveCb) => {
        resolveCb(
            {
                json: () => {
                    try {
                        return mappings[JSON.stringify(request)]()
                    }
                    catch (e) {
                        console.log(request)
                        let stringified = JSON.stringify(request)
                        console.log(stringified)
                        console.error("request not found")
                    }
                }
            }
        )
    })
}

window.XMLHttpRequest = XHRMock as any

global.Request = MockRequest as any
global.fetch = mockFetch as any
