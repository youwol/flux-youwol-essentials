import { child$, HTMLElement$, render } from "@youwol/flux-view"
import { Modal } from "@youwol/fv-group"
import { combineLatest, from, merge, Observable } from "rxjs"
import { ywSpinnerView } from "../youwol-spinner.view"
import { install } from '@youwol/cdn-client'
import { BurgerItem } from "./burger-menu.view"
import { YouwolBannerState } from "./top-banner.view"

/**
 * Preferences burger item
 */
export class SettingsBurgerItem extends BurgerItem {

    static ClassSelector = "settings"

    children = [
        {
            class: "col-sm",
            innerText: "Settings"
        }
    ]

    onclick: () => void


    constructor(params: { state: YouwolBannerState }) {
        super({ withClasses: SettingsBurgerItem.ClassSelector })

        this.onclick = () => {
            modalView(params.state)
        }
    }
}

function fetchCodeMirror$(): Observable<any> {

    return from(
        install({
            modules: ['codemirror'],
            scripts: [
                "codemirror#5.52.0~mode/javascript.min.js"
            ],
            css: [
                "codemirror#5.52.0~codemirror.min.css",
                "codemirror#5.52.0~theme/blackboard.min.css"
            ]
        })
    )
}

export function modalView(state: YouwolBannerState) {

    let configurationCodeMirror = {
        value: "",
        mode: 'javascript',
        lineNumbers: false,
        theme: 'blackboard',
        lineWrapping: true,
        indentUnit: 4
    }

    let modalState = new Modal.State()
    let view = new Modal.View({
        state: modalState,
        contentView: () => {
            return {
                class: 'p-3 rounded fv-color-focus fv-bg-background fv-text-primary',
                style: { width: '75vw', height: '50vh' },
                children: [
                    child$(
                        combineLatest([state.settings$, fetchCodeMirror$()]),
                        ([settings]) => ({
                            class: 'h-100 w-100',
                            connectedCallback: (elem: HTMLDivElement & HTMLElement$) => {
                                let config = {
                                    configurationCodeMirror,
                                    value: settings.text,
                                    extraKeys: {
                                        "Ctrl-S": (cm) => { }
                                    }
                                }
                                let editor = window['CodeMirror'](elem, config)
                                let sub = merge(...[modalState.cancel$, modalState.ok$]).subscribe(() => {
                                    state.setSettings(editor.getValue())
                                    modalDiv.remove()
                                })
                                elem.ownSubscriptions(sub)
                            }
                        }),
                        {
                            untilFirst: ywSpinnerView({ classes: 'mx-auto', size: '50px', duration: 1.5 }) as any
                        }
                    ),
                ]
            }
        }
    } as any)
    let modalDiv = render(view)
    document.querySelector("body").appendChild(modalDiv)
    return view
}


