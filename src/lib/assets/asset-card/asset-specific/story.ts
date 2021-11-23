import { VirtualDOM } from "@youwol/flux-view"
import { Asset, ButtonPermissionView } from "../../.."


export class StoryActionsView implements VirtualDOM {

    static ClassSelector = "story-actions-view"
    class = `${StoryActionsView.ClassSelector} d-flex w-100 justify-content-around`
    children: VirtualDOM

    constructor(asset: Asset) {
        let view = new ButtonPermissionView({ name: 'read', withClass: "", enabled: true })
        view.state.click$.subscribe(() => {
            window.location.href = `/ui/stories/?id=${asset.rawId}`
        })
        this.children = [
            view
        ]
    }
}
