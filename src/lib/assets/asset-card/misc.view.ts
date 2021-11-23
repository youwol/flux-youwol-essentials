import { attr$, child$, VirtualDOM } from "@youwol/flux-view"
import { BehaviorSubject } from "rxjs"



export class TextEditableView implements VirtualDOM {

    static ClassSelector = "text-editable-view"
    public readonly class = `${TextEditableView.ClassSelector} d-flex justify-content-center align-items-center`
    public readonly children: VirtualDOM[]
    public readonly editionMode$ = new BehaviorSubject(false)

    public readonly text$: BehaviorSubject<string>
    public readonly attrText$: any
    public readonly regularView: (text$) => VirtualDOM
    public readonly templateEditionView: VirtualDOM

    constructor(params: {
        text$: BehaviorSubject<string>,
        regularView: (text$) => VirtualDOM,
        templateEditionView?: VirtualDOM
    }) {

        Object.assign(this, params)
        this.templateEditionView = this.templateEditionView || { tag: 'input', type: 'text' }
        this.attrText$ = attr$(this.text$, (text) => text)
        this.children = [
            child$(
                this.editionMode$,
                (isEditing) => isEditing
                    ? this.editionView()
                    : this.regularView(this.text$)
            ),
            child$(
                this.editionMode$,
                (isEditing) => isEditing
                    ? {}
                    : {
                        tag: 'button',
                        class: 'fas fv-btn-primary fa-pen border rounded p-1 mx-2',
                        onclick: () => this.editionMode$.next(true)
                    })
        ]
    }

    editionView() {
        return {
            ...(this.templateEditionView as any),
            placeholder: this.attrText$,
            value: this.attrText$,
            onkeypress: (ev: KeyboardEvent) => {
                if (ev.key == 'Enter' && !ev.shiftKey) {
                    console.log(ev)
                    this.editionMode$.next(false)
                    this.text$.next(ev.target['value'])
                }
            }
        }
    }
}
