import { child$, VirtualDOM } from "@youwol/flux-view"
import { combineLatest, Observable } from "rxjs"
import { uuidv4 } from "@youwol/flux-core"

import { Tabs } from '@youwol/fv-tabs'

import { AssetOverview } from "./overview/overview.view"
import { Asset, getSettings$, Settings, ywSpinnerView } from "../.."


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


export class AssetCardView implements VirtualDOM {

    static ClassSelector = "asset-card-view"
    public readonly class = `${AssetCardView.ClassSelector} p-3 rounded fv-color-focus fv-bg-background w-100 h-50 fv-text-primary`
    public readonly style = { maxWidth: '1000px' }
    public readonly children: VirtualDOM[]
    public readonly asset$: Observable<Asset>
    public readonly actionsFactory: (asset: Asset) => VirtualDOM

    constructor(params: {
        asset$: Observable<Asset>,
        actionsFactory: (asset: Asset) => VirtualDOM
    }) {

        Object.assign(this, params)
        this.children = [
            child$(
                combineLatest([this.asset$, getSettings$()]),
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

        let mainView = new AssetOverview({ asset, actionsFactory: this.actionsFactory })

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
}
