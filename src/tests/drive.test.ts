import { Interfaces } from '@youwol/flux-files'
import { AssetsGatewayClient } from '../lib/assets-gateway-client'
import { Drive } from '../lib/drive'
import './mock-requests'

let assetsGtwClient = new AssetsGatewayClient()

test('get drive', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.createFolder("parent_folder","test_post_folder").subscribe( 
        resp => {
            expect(resp).toEqual(  new Interfaces.Folder("test_post_folder","test_post_folder","parent_folder", drive))
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})

test('delete drive', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.deleteFolder("test_folder").subscribe( 
        resp => {
            expect(resp.driveId).toEqual("test_drive")
            expect(resp.entityId).toEqual("test_folder")
            expect(resp.type).toEqual("folder")
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})

test('rename file', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)
    let item = new Interfaces.File("test_item", "test_item_name","folder", drive, "")

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.renameItem(item, "test_item_new_name").subscribe( 
        resp => {
            expect(resp).toBeInstanceOf(Interfaces.File)
            expect(resp.id).toEqual("test_item")
            expect(resp.name).toEqual("test_item_new_name")
            expect(resp.drive).toEqual(drive)
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})

test('rename folder', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)
    let item = new Interfaces.Folder("test_folder", "test_folder_name","folder", drive)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.renameItem(item, "test_folder_new_name").subscribe( 
        resp => {
            expect(resp).toBeInstanceOf(Interfaces.Folder)
            expect(resp.id).toEqual("test_folder")
            expect(resp.name).toEqual("test_folder_new_name")
            expect(resp.drive).toEqual(drive)
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})

test('rename drive', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.renameItem(drive, "test_drive_new_name").subscribe( 
        resp => {
            expect(resp).toBeInstanceOf(Interfaces.Drive)
            expect(resp.id).toEqual("test_drive")
            expect(resp.name).toEqual("test_drive_new_name")
            expect(resp.drive).toEqual(resp)
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})


test('get file', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.getFile("item_treeId").subscribe( 
        resp => {
            expect(resp).toBeInstanceOf(Interfaces.File)
            expect(resp.id).toEqual("item_treeId")
            expect(resp.name).toEqual("test item")
            expect(resp.parentFolderId).toEqual("folder")
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})

test('list items', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.listItems("folder_tree_id").subscribe( 
        
        ({folders,files}) => {
            expect(folders.length).toEqual(1)
            expect(files.length).toEqual(1)
            expect(files[0]).toBeInstanceOf(Interfaces.File)
            expect(folders[0]).toBeInstanceOf(Interfaces.Folder)
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})

test('delete file', (done) => {
    
    let drive = new Drive('test_drive', 'Test drive', assetsGtwClient)

    let notifications = []
    drive.events$.subscribe( (event:Interfaces.EventIO) => {
        notifications.push(event.step)
    })

    drive.deleteFile("test_item").subscribe( 
        
        (item) => {
            expect(item.driveId).toEqual('test_drive')
            expect(item.entityId).toEqual('test_item')
            expect(item.type).toEqual('item')
            expect(notifications).toEqual([Interfaces.Step.STARTED, Interfaces.Step.FINISHED])
            done()
        })
})