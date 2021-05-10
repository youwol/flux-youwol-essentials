import { Interfaces } from "@youwol/flux-files"
import { Subject } from "rxjs"
import { AssetsGatewayClient, EntityNotFoundByName } from "../lib/assets-gateway-client"
import './mock-requests'


test('get groups', (done) => {
    
    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().getGroups(follower).subscribe(
        ({groups}) => {
            expect(groups.length).toEqual(1)
            expect(groups[0].id).toEqual("test_group")
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        },
        (err) => {
            throw(err)
        }
    )
})


test('get drives', (done) => {
    
    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().getDrives("test_group",follower).subscribe(
        ({drives}) => {
            expect(drives.length).toEqual(1)
            expect(drives[0].driveId).toEqual("test_drive")
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        },
        (err) => {
            throw(err)
        }
    )
})

test('get drive', (done) => {
    
    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().getDrive("/youwol-users/test_group","Test drive",follower).subscribe(
        (drive) => {
            expect(drive.driveId).toEqual("test_drive")
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        },
        (err) => {
            throw(err)
        }
    )
})


test('get drive wrong group name', (done) => {

    new AssetsGatewayClient().getDrive("/youwol-users/tet_group","Test drive").subscribe(
        (drive) => {            
            throw Error('The drive should not exist')
        },
        (err: EntityNotFoundByName) => {
            expect(err).toBeInstanceOf(EntityNotFoundByName)
            expect(err.entityName).toEqual("/youwol-users/tet_group")
            done()
        }
    )
})


test('get drive wrong drive name', (done) => {

    new AssetsGatewayClient().getDrive("/youwol-users/test_group","est drive").subscribe(
        (drive) => {
            throw Error('The drive should not exist')
        },
        (err: EntityNotFoundByName) => {
            expect(err).toBeInstanceOf(EntityNotFoundByName)
            expect(err.entityName).toEqual("est drive")
            done()
        }
    )
})


test('post drive', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().postDrive({
        name:"test_post_drive", groupId:"/youwol-users/test_group"},
        follower).subscribe(
            (drive) => {
                expect(drive.driveId).toEqual("test_drive_post")
                expect(drive.name).toEqual("test drive posted")
                expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
                done()
            },
            (err) => {
                throw(err)
            }
    )
})


test('post drive error', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().postDrive({
        name:"test_post_drive", groupId:"/youwol-users/error_group"},
        follower).subscribe(
            (drive) => {
                throw Error('The request should have failed')
            },
            (err) => {
                expect(err).toBeInstanceOf(Error)
                done()
            }
    )
})


test('post folder', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().postFolder({
        name:"test_post_folder", parentFolderId: "parent_folder"},
        follower).subscribe(
            (folder) => {
                expect(folder.folderId).toEqual('test_post_folder')
                expect(folder.name).toEqual('test_post_folder')
                expect(folder.parentFolderId).toEqual('parent_folder')
                expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
                done()
            },
            (err) => {
                throw(err)
            }
    )
})


test('post folder error', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().postFolder({
        name:"test_post_folder", parentFolderId: "error_parent_folder"},
        follower).subscribe(
            (folder) => {
                throw Error('The request should have failed')
            },
            (err) => {
                expect(err).toBeInstanceOf(Error)
                done()
            }
    )
})

test('delete folder', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().deleteFolder("test_folder", follower).subscribe(
            (folder) => {
                expect(folder.driveId).toEqual('test_drive')
                expect(folder.entityId).toEqual('test_folder')
                expect(folder.type).toEqual('folder')
                expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
                done()
            },
            (err) => {
                throw(err)
            }
    )
})

test('rename item', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().renameItem("test_item", "test_item_new_name", follower).subscribe(
            (item) => {
                expect(item.name).toEqual('test_item_new_name')
                expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
                done()
            },
            (err) => {
                throw(err)
            }
    )
})

test('rename folder', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().renameFolder("test_folder", "test_folder_new_name", follower).subscribe(
            (item) => {
                expect(item.name).toEqual('test_folder_new_name')
                expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
                done()
            },
            (err) => {
                throw(err)
            }
    )
})

test('rename drive', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe((event: Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().renameDrive("test_drive", "test_drive_new_name", follower).subscribe(
        (item) => {
            expect(item.name).toEqual('test_drive_new_name')
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        },
        (err) => {
            throw (err)
        }
    )
})


test('delete item', (done) => {

    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    new AssetsGatewayClient().deleteItem("test_drive", "test_item", follower).subscribe(
            (item) => {
                expect(item.driveId).toEqual('test_drive')
                expect(item.entityId).toEqual('test_item')
                expect(item.type).toEqual('item')
                expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
                done()
            },
            (err) => {
                throw(err)
            }
    )
})


test('get item', (done) => {
    
    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })
    new AssetsGatewayClient().getItem("item_treeId",follower).subscribe(
        (item) => {
            expect(item.treeId).toEqual("item_treeId")
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        },
        (err) => {
            throw(err)
        }
    )
})


test('get items', (done) => {
    
    let follower = new Subject<Interfaces.Event>()
    let notifications = []
    follower.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })
    new AssetsGatewayClient().getItems("folder_tree_id",follower).subscribe(
        ({folders, items}) => {
            expect(folders.length).toEqual(1)
            expect(items.length).toEqual(1)
            done()
        },
        (err) => {
            throw(err)
        }
    )
})