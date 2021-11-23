import { expectAttribute } from "@youwol/flux-core";
import { Modal } from "@youwol/fv-group";
import { of } from "rxjs"
import { popupAssetModalView } from "../..";
import { AssetCardView } from "../../lib/assets/asset-card/asset-card.view";
import { FluxProjectActionsView } from "../../lib/assets/asset-card/asset-specific/flux";
import { ImagesCarouselView } from "../../lib/assets/utils.view";



beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.setItem("settings", `
    return () => ({
        defaultApplications: [{
            canOpen: (asset) => asset.kind === 'data' && asset.name.endsWith('.txt'),
            name:'text preview',
            applicationURL: (asset) => \`/text-preview/\${asset.assetId}\`
        }
        ]
    })
    `)
});

/*
test('asset modal-view => kind=flux-project', (done) => {

    let asset = {
        assetId: 'test-asset',
        rawId: 'test-asset',
        kind: 'flux-project',
        name: 'Test package',
        groupId: '',
        description: 'an asset for test',
        images: ["/images/image1.png", "/images/image2.png", "/images/image3.png"],
        thumbnails: ["/thumbnails/image1.png", "/thumbnails/image2.png", "/thumbnails/image3.png"],
        tags: ['test', 'flux-project', 'modal', 'flux-yw-essential'],
        permissions: {
            read: true,
            write: true
        }
    }
    popupAssetModalView({
        asset$: of(asset)
    })
    let modalView = document.querySelector(`.${AssetModalView.ClassSelector}`)
    expect(modalView).toBeTruthy()

    let actionsView = modalView.querySelector(`.${FluxProjectActionsView.ClassSelector}`)
    expect(actionsView).toBeTruthy()

    let buttons = Array.from(actionsView.querySelectorAll("button"))
    expect(buttons.length).toEqual(3)
    buttons.forEach((btn) => {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        // How to make sure the location has changed ?
    });

    let carouselView = document.querySelector(`.${ImagesCarouselView.ClassSelector}`)
    expect(carouselView).toBeTruthy()

    let imgView = carouselView.querySelector('img') as HTMLImageElement
    expect(imgView).toBeTruthy()
    expect(imgView.src.endsWith("/images/image1.png")).toBeTruthy()

    let handleNextView = carouselView.querySelector('.handle-next') as HTMLImageElement
    expect(handleNextView).toBeTruthy()
    handleNextView.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    imgView = carouselView.querySelector('img') as HTMLImageElement
    expect(imgView).toBeTruthy()
    expect(imgView.src.endsWith("/images/image2.png")).toBeTruthy();

    let handlePreviousView = carouselView.querySelector('.handle-previous') as HTMLImageElement
    expect(handlePreviousView).toBeTruthy()
    handlePreviousView.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    imgView = carouselView.querySelector('img') as HTMLImageElement
    expect(imgView).toBeTruthy()
    expect(imgView.src.endsWith("/images/image1.png")).toBeTruthy()


    handlePreviousView = carouselView.querySelector('.handle-previous') as HTMLImageElement
    expect(handlePreviousView).toBeFalsy();

    (modalView.parentElement.parentElement as any as Modal.View).state.cancel$.next(new MouseEvent('click'))
    modalView = document.querySelector(`.${AssetModalView.ClassSelector}`)
    expect(modalView).toBeFalsy()

    done()
})


test('asset modal-view => kind=story', (done) => {

    let asset = {
        assetId: 'test-asset',
        rawId: 'test-asset',
        kind: 'story',
        name: 'Test package',
        groupId: '',
        description: 'an asset for test',
        images: [],
        thumbnails: [],
        tags: ['test', 'story', 'modal', 'flux-yw-essential'],
        permissions: {
            read: true,
            write: true
        }
    }
    popupAssetModalView({
        asset$: of(asset)
    })
    let buttons = Array.from(document.querySelectorAll("button"))
    expect(buttons.length).toEqual(1)
    // Read story
    // How to make sure the location has changed ?
    buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))

    done()
})


test('asset modal-view => kind=data with default app', (done) => {

    let asset = {
        assetId: 'test-asset-data',
        rawId: 'test-asset',
        kind: 'data',
        name: 'Test-asset-data.txt',
        groupId: '',
        description: 'test data',
        images: [],
        thumbnails: [],
        tags: ['test', 'story', 'modal', 'flux-yw-essential'],
        permissions: {
            read: true,
            write: true
        }
    }
    popupAssetModalView({
        asset$: of(asset)
    })
    let defaultAppHeaderView = document.querySelector('.default-app')
    expect(defaultAppHeaderView).toBeTruthy()
    defaultAppHeaderView.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    let iframe = document.querySelector('iframe')
    expect(iframe).toBeTruthy()
    done()
})
*/
