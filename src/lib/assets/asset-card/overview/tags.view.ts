import { attr$, child$, children$, HTMLElement$, VirtualDOM } from "@youwol/flux-view";
import { BehaviorSubject, Observable, of } from "rxjs";
import { TextEditableView } from "../misc.view";
import { skip } from "rxjs/operators";
import { Asset } from "../../..";

export class AssetTagsView implements VirtualDOM {

    static ClassSelector = "asset-tags-view"

    public readonly class = `${AssetTagsView.ClassSelector} w-100`
    public readonly asset: Asset
    public readonly children: VirtualDOM[]
    public readonly tags$: BehaviorSubject<string[]>

    constructor(params: { tags$: BehaviorSubject<string[]>, asset: Asset }) {

        Object.assign(this, params)
        this.children = [
            child$(this.tags$,
                (tags) => tags.length == 0
                    ? {
                        style: {
                            fontStyle: 'italic'
                        },
                        innerText: "No tag has been provided yet"
                    }
                    : {}),
            this.asset.permissions.write
                ? new TagsEditableView({ tags$: this.tags$ })
                : AssetTagsView.readOnlyView(this.tags$)
        ]
    }

    static readOnlyView(tags$: BehaviorSubject<string[]>) {
        return {
            class: 'd-flex flex-wrap align-items-center',
            children: children$(
                tags$,
                (tag) => AssetTagsView.tagView(of(tag))
            )
        }
    }

    static tagView(tag$: Observable<string>) {
        return {
            class: 'border rounded p-2 mx-2',
            innerText: attr$(tag$, tag => tag)
        }
    }
}

class TagsEditableView implements VirtualDOM {

    static ClassSelector = "tags-editable-view"
    public readonly class = `${TagsEditableView.ClassSelector}`
    public readonly children: VirtualDOM[]
    public readonly editionMode$ = new BehaviorSubject(false)

    public readonly tags$: BehaviorSubject<string[]>

    constructor(params: { tags$: BehaviorSubject<string[]> }) {

        Object.assign(this, params)

        this.children = [
            {
                class: 'd-flex flex-align-center  flex-wrap',
                children: children$(
                    this.tags$,
                    (tags) => tags.map((tag, i) => new EditableTagView({ tags$: this.tags$, index: i }))
                )
            },
            {
                tag: 'button',
                class: 'fas fv-btn-primary fa-plus border rounded p-1',
                onclick: () => {
                    let tags = this.tags$.getValue()
                    this.tags$.next([...tags, 'new tag'])
                }
            }
        ]
    }
}

class EditableTagView implements VirtualDOM {

    public readonly class = 'd-flex flex-align-center'
    public readonly tag: string
    public readonly children: VirtualDOM[]

    public readonly tags$: BehaviorSubject<string[]>
    public readonly index: number

    connectedCallback: (elem: HTMLElement$ & HTMLDivElement) => void

    constructor(params: { index: number, tags$: BehaviorSubject<string[]> }) {

        Object.assign(this, params)
        let text$ = new BehaviorSubject(this.tags$.getValue()[this.index])

        this.children = [
            child$(
                this.tags$,
                (tags) => ({
                    class: 'd-flex flex-align-center mr-5 my-2',
                    children: [
                        new TextEditableView({
                            text$,
                            regularView: (text$) => ({ innerText: attr$(text$, t => t) }),
                            class: 'border rounded p-2 mx-1 d-flex flex-align-center'
                        } as any),
                        {
                            tag: 'button',
                            class: 'fas fv-btn-primary fa-trash border rounded p-1',
                            onclick: () => {
                                let newTags = this.tags$.getValue().filter((_, i) => i != this.index);
                                this.tags$.next(newTags)
                            }
                        }]
                })
            )
        ]
        this.connectedCallback = (elem) => {
            elem.ownSubscriptions(
                text$.pipe(skip(1)).subscribe((text) => {
                    let newTags = this.tags$.getValue()
                    newTags[this.index] = text
                    this.tags$.next(newTags)
                })
            )
        }
    }
}
