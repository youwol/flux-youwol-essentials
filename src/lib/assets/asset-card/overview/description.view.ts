import { attr$, child$, VirtualDOM } from "@youwol/flux-view";
import { BehaviorSubject } from "rxjs";
import { TextEditableView } from "../misc.view";
import { skip } from "rxjs/operators";
import { Asset } from "../../..";

export class AssetDescriptionView implements VirtualDOM {

    static ClassSelector = "asset-description-view"

    public readonly class = `${AssetDescriptionView.ClassSelector} w-100`
    public readonly asset: Asset
    public readonly children: VirtualDOM[]
    public readonly description$: BehaviorSubject<string>

    constructor(params: { description$: BehaviorSubject<string>, asset: Asset }) {

        Object.assign(this, params)
        this.children = [
            child$(this.description$,
                (description: string) => description.trim() == ""
                    ? {
                        style: {
                            fontStyle: 'italic'
                        },
                        innerText: "No description has been provided yet (shift+enter for new-line)"
                    }
                    : {}),
            this.asset.permissions.write
                ? new DescriptionEditableView({ description$: this.description$ })
                : AssetDescriptionView.readOnlyView(this.description$)
        ]
    }

    static readOnlyView(description$: BehaviorSubject<string>) {
        return {
            tag: 'pre',
            class: 'fv-text-primary',
            innerText: attr$(description$, d => d)
        }
    }
}

class DescriptionEditableView implements VirtualDOM {

    static ClassSelector = "description-editable-view"
    public readonly class = `${DescriptionEditableView.ClassSelector} d-flex justify-content-center align-items-center`
    public readonly children: VirtualDOM[]
    public readonly editionMode$ = new BehaviorSubject(false)

    public readonly description$: BehaviorSubject<string>

    constructor(params: { description$: BehaviorSubject<string> }) {

        Object.assign(this, params)

        this.children = [
            new TextEditableView({
                text$: this.description$,
                regularView: (description$) => AssetDescriptionView.readOnlyView(description$),
                templateEditionView: {
                    tag: 'textarea',
                    class: 'w-100',
                    style: { width: '25%' }
                },
                class: 'w-100'
            } as any)
        ]
    }
}
