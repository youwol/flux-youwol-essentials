import { render } from "@youwol/flux-view";
import { BehaviorSubject, from, of } from "rxjs"
import { AssetSnippetView, AssetsListView } from "../.."


beforeEach(() => {
    document.body.innerHTML = "";
});


test('assets-list with one asset', (done) => {

    let assets = [{
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
    }]
    let state = {
        selectedAsset$: new BehaviorSubject("test-asset-other"),
        selectAsset: () => {
            let selected = document.querySelector(`.${AssetSnippetView.ClassSelector} .selected`)
            expect(selected).toBeTruthy()
        }
    }
    let view = new AssetsListView({
        assets$: of(assets),
        state
    })
    document.body.appendChild(render(view))
    let elem = document.querySelector(`.${AssetsListView.ClassSelector}`)
    expect(elem).toBeTruthy()
    done()
})
