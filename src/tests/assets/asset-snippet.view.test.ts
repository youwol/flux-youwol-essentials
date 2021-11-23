import { render } from "@youwol/flux-view";
import { BehaviorSubject } from "rxjs"
import { AssetSnippetView } from "../.."


beforeEach(() => {
    document.body.innerHTML = "";
});


test('render an asset-card, no images', (done) => {

    let asset = {
        assetId: 'test-asset',
        rawId: 'test-asset',
        kind: 'package',
        name: 'Test package',
        groupId: '',
        description: 'an asset for test',
        images: [],
        thumbnails: [],
        tags: ['test', 'package', 'flux-yw-essential'],
        permissions: {
            read: true,
            write: true
        }
    }
    let selectedAsset$ = new BehaviorSubject("test-asset-other")
    let state = {
        selectedAsset$,
        selectAsset: (assetId) => {
            selectedAsset$.next(assetId)
            let selected = document.querySelector(`.selected`)
            expect(selected).toBeTruthy()
            done()
        }
    }
    let view = new AssetSnippetView({
        asset,
        state
    })
    document.body.appendChild(render(view))
    let elem = document.querySelector(`.${AssetSnippetView.ClassSelector}`)
    expect(elem).toBeTruthy()
    let selected = document.querySelector(`.${AssetSnippetView.ClassSelector} .selected`)
    expect(selected).toBeFalsy()
    elem.dispatchEvent(new MouseEvent('click', { bubbles: true }))

})

test('render an asset-card, with images', (done) => {

    let asset = {
        assetId: 'test-asset',
        rawId: 'test-asset',
        kind: 'package',
        name: 'Test package',
        groupId: '',
        description: 'an asset for test',
        images: ['images/img.png'],
        thumbnails: ['thumbnails/img.png'],
        tags: ['test', 'package', 'flux-yw-essential'],
        permissions: {
            read: true,
            write: true
        }
    }
    let state = {
        selectedAsset$: new BehaviorSubject("test-asset"),
        selectAsset: () => { }
    }
    let view = new AssetSnippetView({
        asset,
        state
    })
    document.body.appendChild(render(view))
    done()
})

