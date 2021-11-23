import { VirtualDOM } from "@youwol/flux-view"
import { BehaviorSubject } from "rxjs"
import { AssetTitleView } from "./title.view"
import { AssetDescriptionView } from "./description.view"
import { AssetTagsView } from "./tags.view"
import { AssetScreenShotsView } from "./screenshots.view"
import { Asset } from "../../.."

/*
export function actionViewFactory(assetKind: string) {
    let factory = {
        'flux-project': (asset: Asset) => new FluxProjectActionsView(asset),
        'story': (asset: Asset) => new StoryActionsView(asset)
    }
    return factory[assetKind] ? factory[assetKind] : () => ({})
}*/

export class AssetOverview implements VirtualDOM {

    static ClassSelector = "asset-overview"
    public readonly class = `${AssetOverview.ClassSelector} w-100 p-3 px-5 h-100 overflow-auto fv-text-primary`
    public readonly children: VirtualDOM[]

    public readonly asset: Asset

    public readonly name$: BehaviorSubject<string>
    public readonly tags$: BehaviorSubject<string[]>
    public readonly description$: BehaviorSubject<string>
    public readonly images$: BehaviorSubject<string[]>
    public readonly actionsFactory: (asset: Asset) => VirtualDOM


    constructor(params: { asset: Asset, actionsFactory: (asset: Asset) => VirtualDOM }) {

        Object.assign(this, params)
        this.name$ = new BehaviorSubject(this.asset.name)
        this.tags$ = new BehaviorSubject(this.asset.tags)
        this.description$ = new BehaviorSubject(this.asset.description)
        this.images$ = new BehaviorSubject(this.asset.images)

        let hr = { tag: 'hr' }

        this.children = [
            new AssetTitleView({ name$: this.name$, asset: this.asset }),
            hr,
            this.actionsFactory(this.asset),
            hr,
            this.sectionTitleView("Tags"),
            new AssetTagsView({ tags$: this.tags$, asset: this.asset }),
            hr,
            this.sectionTitleView("ScreenShots"),
            new AssetScreenShotsView({ asset: this.asset, images$: this.images$ }),
            hr,
            this.sectionTitleView("Descriptions"),
            new AssetDescriptionView({ description$: this.description$, asset: this.asset })
        ]
    }

    sectionTitleView(title: string) {
        return {
            tag: 'h3',
            class: 'border-bottom',
            innerText: title
        }
    }
}
