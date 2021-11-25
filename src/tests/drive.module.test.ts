import { ErrorLog, instantiateModules, MockEnvironment, parseGraph, Runner } from "@youwol/flux-core"
import { Interfaces, ModuleFilePicker, ModuleReader } from "@youwol/flux-files"
import { ModuleYouwolDrive } from ".."

import './mock-requests'
import { XHRMock } from "./mock-requests"


let createEnv = () => new MockEnvironment({
    console: {
        log: () => { },
        error: (...args) => { console.error(args) },
        warn: (...args) => { console.warn(args) }
    }
})


test('test filePicker OK', (done) => {

    let environment = createEnv()

    let branches = [
        '-|~localDrive~|---|~filePicker~|--'
    ]
    let modules: {
        localDrive: ModuleYouwolDrive.Module,
        filePicker: ModuleFilePicker.Module
    } = instantiateModules({
        localDrive: [ModuleYouwolDrive, { ywGroup: '/youwol-users/test_group', ywDrive: 'Test drive' }],
        filePicker: [ModuleFilePicker, { fileId: 'item_treeId' }]
    }, { environment })
    let graph = parseGraph({ branches, modules })

    new Runner(graph)

    modules.filePicker.file$.pipe(
    ).subscribe(({ data }) => {
        expect(data).toBeInstanceOf(Interfaces.File)
        done()
    })
})


test('test filePicker error group', (done) => {

    let environment = createEnv()

    let branches = [
        '-|~localDrive~|---|~filePicker~|--'
    ]
    let modules: {
        localDrive: ModuleYouwolDrive.Module,
        filePicker: ModuleFilePicker.Module
    } = instantiateModules({
        localDrive: ModuleYouwolDrive,
        filePicker: [ModuleFilePicker, { fileId: 'item_treeId' }]
    }, { environment })
    let graph = parseGraph({ branches, modules })

    new Runner(graph)

    environment.errors$.subscribe((error) => {
        expect(error).toBeInstanceOf(ErrorLog)
        done()
    })
    modules.filePicker.file$.pipe(
    ).subscribe(({ data }) => {
        throw Error("This path can not be active: group does not exists")
    })
})


test('test fileReader ok', (done) => {

    let environment = createEnv()
    XHRMock.responseText = JSON.stringify({ status: 'completed' })
    XHRMock.readyState = 4
    XHRMock.status = 200

    let branches = [
        '-|~localDrive~|---|~filePicker~|---|~reader~|-'
    ]
    let modules: {
        localDrive: ModuleYouwolDrive.Module,
        filePicker: ModuleFilePicker.Module,
        reader: ModuleReader.Module
    } = instantiateModules({
        localDrive: [ModuleYouwolDrive, { ywGroup: '/youwol-users/test_group', ywDrive: 'Test drive' }],
        filePicker: [ModuleFilePicker, { fileId: 'item_treeId' }],
        reader: [ModuleReader, { mode: 'text' }]
    }, { environment })
    let graph = parseGraph({ branches, modules })

    new Runner(graph)

    environment.errors$.subscribe((logError) => {
        throw logError.error
    })
    modules.reader.content$.pipe(
    ).subscribe(({ data }) => {
        expect(data.content).toEqual(JSON.stringify({ status: 'completed' }))
        expect(data.file).toBeInstanceOf(Interfaces.File)
        done()
    })
})


