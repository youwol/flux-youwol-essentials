import { attr$, child$, VirtualDOM } from "@youwol/flux-view";
import { BehaviorSubject } from "rxjs";
import { Asset } from "../../..";
import { TextEditableView } from "../misc.view";



export class ImagesCarouselView implements VirtualDOM {

    static ClassSelector = "images-carousel-view"
    public class: string
    public readonly style: Record<string, string>

    public readonly children: VirtualDOM[]
    public readonly selectedSnippet$ = new BehaviorSubject(0)
    public readonly imagesURL: string[]

    constructor(parameters: {
        imagesURL: string[],
        legend?: string,
        onDelete?: (index: number) => void,
        class,
        style
    }) {

        Object.assign(this, parameters)
        this.class = `${ImagesCarouselView.ClassSelector} ${this.class}`
        this.children = [
            {
                class: "d-flex align-items-center w-100 h-100",
                children: [
                    child$(
                        this.selectedSnippet$,
                        (index) => this.handleView(index, 'fa-chevron-left ml-auto', -1)
                    ),
                    child$(
                        this.selectedSnippet$,
                        (index) => ({
                            class: 'd-flex w-100 h-100 position-relative',
                            children: [
                                {
                                    class: "px-2 w-100 h-100",
                                    tag: 'img',
                                    style: {
                                        height: 'auto'
                                    },
                                    src: this.imagesURL[index],

                                },
                                parameters.onDelete
                                    ? {
                                        style: {
                                            left: '100%'
                                        },
                                        class: 'fas fa-trash fv-text-error position-absolute fv-pointer',
                                        onclick: () => parameters.onDelete(index)
                                    }
                                    : {}
                            ]
                        })
                    ),
                    child$(
                        this.selectedSnippet$,
                        (index) => this.handleView(index, 'fa-chevron-right mr-auto', 1)
                    ),
                ]
            },
            {
                style: {
                    fontStyle: 'italic'
                },
                class: 'mt-2',
                innerText: parameters.legend || ""
            }
        ]
    }

    handleView(index, icon, increment) {
        return (increment == -1 && index > 0) || (increment == 1 && index < this.imagesURL.length - 1)
            ? {
                style: { width: '50px' },
                class: `fas ${icon} my-auto fa-2x fv-pointer fv-text-primary fv-hover-text-focus handle-${increment > 0 ? 'next' : 'previous'}`,
                onclick: () => this.selectedSnippet$.next(this.selectedSnippet$.getValue() + increment)
            }
            : {
                style: { width: '50px' },
                class: increment > 0 ? 'handle-right-none mr-auto' : 'handle-left-none ml-auto'
            }
    }
}


export class AssetScreenShotsView implements VirtualDOM {

    static ClassSelector = "asset-screenshots-view"

    public readonly class = `${AssetScreenShotsView.ClassSelector} w-100`
    public readonly asset: Asset
    public readonly children: VirtualDOM[]
    public readonly images$: BehaviorSubject<string[]>

    constructor(params: { images$: BehaviorSubject<string[]>, asset: Asset }) {

        window.addEventListener("paste", (pasteEvent) => {
            this.addImageFromClipboard(pasteEvent)
        }, false);


        Object.assign(this, params)

        this.children = [
            child$(
                this.images$,
                (images) => images.length > 0 ?
                    new ImagesCarouselView({
                        imagesURL: images,
                        class: 'd-flex flex-column align-items-center mx-auto',
                        style: {
                            height: '25vh',
                            width: '25vw'
                        },
                        legend: 'Paste from clipboard to add an image',
                        onDelete: (index) => {
                            let images = this.images$.getValue().filter((_, i) => i != index)
                            this.images$.next(images)
                        }
                    })
                    : {
                        style: {
                            fontStyle: 'italic'
                        },
                        innerText: "No screenshot has been provided: paste from clipboard to add an image."
                    }
            )
        ]
    }

    addImageFromClipboard(pasteEvent) {

        let files = pasteEvent.clipboardData.files;
        if (files.length == 1 && files[0].type.indexOf("image") === 0) {
            var file = files[0];
            //let picture = this.newImage(URL.createObjectURL(file), file)
            let url = URL.createObjectURL(file)
            this.images$.next([...this.images$.getValue(), url])
        }
    }

}
