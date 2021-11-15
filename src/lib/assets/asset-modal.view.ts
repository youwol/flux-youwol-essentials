import { child$, HTMLElement$, render, VirtualDOM } from "@youwol/flux-view"
import { Modal } from "@youwol/fv-group"
import { BehaviorSubject, combineLatest, merge, Observable } from "rxjs"
import { uuidv4 } from "@youwol/flux-core"
import { Asset, AssetsGatewayClient } from "../assets-gateway-client"
import { ButtonView, ImagesCarouselView } from "./utils.view"
import { Tabs } from '@youwol/fv-tabs'
import { getSettings$, Settings } from "../top-banner"
import { ywSpinnerView } from "../youwol-spinner.view"
import { take } from "rxjs/operators"


export class FluxProjectActionsView implements VirtualDOM {

    static ClassSelector = "flux-project-actions-view"
    class = `${FluxProjectActionsView.ClassSelector} d-flex w-100 justify-content-around`
    children: VirtualDOM

    constructor(asset: Asset) {
        let btnPlay = new ButtonView({ name: 'Play', withClass: "", enabled: asset.permissions.read })
        btnPlay.state.click$.subscribe(() => {
            window.location.href = `/ui/flux-runner/?id=${asset.rawId}`
        })
        let btnEdit = new ButtonView({ name: 'Edit', withClass: "", enabled: asset.permissions.write })

        btnEdit.state.click$.subscribe(() => {
            window.location.href = `/ui/flux-builder/?id=${asset.rawId}`
        })
        let btnDuplicate = new ButtonView({ name: 'Duplicate', withClass: "", enabled: asset.permissions.read })
        btnDuplicate.state.click$.subscribe(() => {
            window.location.href = `/ui/flux-builder/?id=${asset.rawId}`
        })
        this.children = [
            btnPlay,
            btnEdit,
            btnDuplicate
        ]
    }
}

export class StoryActionsView implements VirtualDOM {

    static ClassSelector = "story-actions-view"
    class = `${StoryActionsView.ClassSelector} d-flex w-100 justify-content-around`
    children: VirtualDOM

    constructor(asset: Asset) {
        let view = new ButtonView({ name: 'read', withClass: "", enabled: true })
        view.state.click$.subscribe(() => {
            window.location.href = `/ui/stories/?id=${asset.rawId}`
        })
        this.children = [
            view
        ]
    }
}

export function actionViewFactory(assetKind: string) {
    let factory = {
        'flux-project': (asset: Asset) => new FluxProjectActionsView(asset),
        'story': (asset: Asset) => new StoryActionsView(asset)
    }
    return factory[assetKind] ? factory[assetKind] : () => ({})
}


type AssetPreviewApp = {
    name: string,
    canOpen: (Asset) => boolean,
    applicationURL: (Asset) => string
}

class TabPreview extends Tabs.TabData {
    public readonly preview: AssetPreviewApp

    constructor(preview: AssetPreviewApp) {
        super(preview.name, preview.name)
        this.preview = preview
    }
}


export class AssetModalView implements VirtualDOM {

    static ClassSelector = "asset-modal-view"
    public readonly class = `${AssetModalView.ClassSelector} p-3 rounded fv-color-focus fv-bg-background w-100 h-50 fv-text-primary`
    public readonly style = { maxWidth: '1000px' }
    public readonly children: VirtualDOM[]

    constructor({ asset$ }) {

        this.children = [
            child$(
                combineLatest([asset$, getSettings$()]),
                ([asset, settings]: [Asset, Settings]) => this.presentationView({
                    asset,
                    defaultApplications: settings.defaultApplications
                }),
                {
                    untilFirst: ywSpinnerView({ classes: 'mx-auto', size: '50px', duration: 1.5 }) as any
                }
            )
        ]
    }

    presentationView(parameters: { asset: Asset, defaultApplications: AssetPreviewApp[] }): VirtualDOM {
        let { asset, defaultApplications } = parameters
        let hr = { tag: 'hr' }

        let mainView = {
            class: "w-100 p-3 px-5 h-100 overflow-auto fv-text-primary",
            children: [
                this.titleView(asset),
                hr,
                actionViewFactory(asset.kind)(asset),
                hr,
                new ImagesCarouselView({
                    imagesURL: asset.images,
                    class: 'd-flex mx-auto',
                    style: {
                        height: '25vh',
                        width: '25vw'
                    }
                }),
                hr,
                this.descriptionView(asset)
            ]
        }

        let previews = defaultApplications
            .filter((preview) => preview.canOpen(asset))
            .map((preview) => new TabPreview(preview))

        if (previews.length == 0 || !asset.permissions.read)
            return mainView

        let overViewUid = uuidv4()
        let state = new Tabs.State([new Tabs.TabData(overViewUid, "Overview"), ...previews])
        let view = new Tabs.View({
            state,
            contentView: (_, tabData: TabPreview) => tabData.id == overViewUid
                ? mainView
                : {
                    tag: 'iframe',
                    width: '100%',
                    style: { aspectRatio: '2' },
                    src: tabData.preview.applicationURL(asset)
                },
            headerView: (_, tabData) => ({
                class: `px-2 rounded border ${(tabData.id == overViewUid) ? 'overview' : 'default-app'}`,
                innerText: tabData.name
            })
        })
        return view
    }

    titleView(asset: Asset): VirtualDOM {

        return {
            tag: 'h1',
            class: 'text-center',
            innerText: asset.name
        }
    }

    descriptionView(asset: Asset): VirtualDOM {

        return {
            class: 'w-100  py-2',
            children: [
                {
                    class: 'w-100 text-justify fv-text-primary',
                    innerHTML: asset.description,
                    style: { 'font-size': 'large' }
                }
            ]
        }
    }

}
/**
 * 
 * @param parameters 
 * @param parameters.asset$ observable on asset
 * @returns 
 */
export function popupAssetModalView(parameters: {
    asset$: Observable<Asset>
}) {
    let { asset$ } = parameters
    let modalState = new Modal.State()
    let view = new Modal.View({
        state: modalState,
        contentView: () => new AssetModalView({ asset$ }),
        connectedCallback: (elem: HTMLDivElement & HTMLElement$) => {
            elem.children[0].classList.add("w-100")
            // https://stackoverflow.com/questions/63719149/merge-deprecation-warning-confusion
            merge(...[modalState.cancel$, modalState.ok$])
                .pipe(take(1))
                .subscribe(() => {
                    modalDiv.remove()
                })
        }
    } as any)
    let modalDiv = render(view)
    document.querySelector("body").appendChild(modalDiv)
    return view
}
