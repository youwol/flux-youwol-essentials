import { render, VirtualDOM } from "@youwol/flux-view"
import { BehaviorSubject, of } from "rxjs"
import {
    ComboTogglesView, DashboardLink, FaIconToggleView,
    Preferences, UserSettings, WorkspaceLink, YouwolBannerView,
    BurgerItem,
    BurgerMenu,
    BurgerMenuSection,
    BurgerMenuView,
    LogoView
} from ".."
import { LockerBadge } from "../lib/top-banner/badges"





export enum ViewMode {
    renderOnly = 'renderOnly',
    editOnly = 'editOnly',
    simultaneous = 'simultaneous'
}

export class TopBannerState {

    public readonly viewMode$ = new BehaviorSubject<ViewMode>(ViewMode.renderOnly)
    public readonly readonly = true
    constructor() {
    }
}

export class CustomActionsView implements VirtualDOM {

    static ClassSelector = "custom-actions-view"
    public readonly state: TopBannerState

    public readonly class = `d-flex justify-content-around my-auto custom-actions-view ${CustomActionsView.ClassSelector}`
    public readonly children: VirtualDOM[]

    static iconsFactory = {
        [ViewMode.simultaneous]: 'fa-columns',
        [ViewMode.editOnly]: 'fa-pen',
        [ViewMode.renderOnly]: 'fa-eye'
    }

    constructor(params: { state: TopBannerState }) {

        Object.assign(this, params)
        let viewModeCombo = new ComboTogglesView<ViewMode, TopBannerState>({
            selection$: this.state.viewMode$,
            state: this.state,
            values: [ViewMode.simultaneous, ViewMode.editOnly, ViewMode.renderOnly],
            viewFactory: (mode: ViewMode) => {
                return new FaIconToggleView<ViewMode>({
                    value: mode,
                    selection$: this.state.viewMode$,
                    classes: CustomActionsView.iconsFactory[mode] + ` ${mode}`
                })
            }
        })

        this.children = [
            viewModeCombo
        ]
    }
}


export class BannerView extends YouwolBannerView {

    constructor(state: TopBannerState) {
        super({
            badgesView: new LockerBadge({
                locked$: of(state.readonly)
            }),
            customActionsView: new CustomActionsView({ state }),
            burgerMenuView: new BurgerMenu({
                sections: [
                    new BurgerMenuSection({
                        items: [
                            new DashboardLink(),
                            new WorkspaceLink()
                        ]
                    }),
                    new BurgerMenuSection({
                        items: [
                            new UserSettings(),
                            new Preferences()
                        ]
                    }),
                ]
            })
        })
    }
}

test('rendering: what should be displayed is displayed', (done) => {

    let state = new TopBannerState()
    let bannerView = new BannerView(state)
    document.body.appendChild(render(bannerView))

    let expectedDisplayed = [
        YouwolBannerView.ClassSelector,
        CustomActionsView.ClassSelector,
        ViewMode.editOnly,
        ViewMode.renderOnly,
        ViewMode.simultaneous,
        BurgerMenuView.ClassSelector,
        LogoView.ClassSelector,
        LockerBadge.ClassSelector
    ]
    expectedDisplayed.forEach(selector => {

        let elem = document.querySelector("." + selector)
        expect(elem).toBeTruthy()
    })
    done()
})


test('rendering: open burger menu', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView(state)
    document.body.appendChild(render(bannerView))

    let burgerMenuView = document.querySelector("." + BurgerMenuView.ClassSelector)

    let container = burgerMenuView.querySelector(".content-container")
    expect(container.classList.contains('d-none')).toBeTruthy()
    burgerMenuView.dispatchEvent(new Event("click", { bubbles: true }))
    expect(container.classList.contains('d-block')).toBeTruthy()
    let burgerSections = Array.from(document.querySelectorAll("." + BurgerMenuSection.ClassSelector))
    expect(burgerSections.length).toEqual(2)

    let burgerItems = Array.from(document.querySelectorAll("." + BurgerItem.ClassSelector))

    expect(burgerItems.length).toEqual(5);
    (burgerMenuView as any as BurgerMenuView).onmouseleave()
    expect(container.classList.contains('d-none')).toBeTruthy()
    done()
})


test('combo toggle', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView(state)
    document.body.appendChild(render(bannerView))

    let toggles = Array.from(document.querySelectorAll("." + FaIconToggleView.ClassSelector));
    expect(toggles.length).toEqual(3);
    toggles[0].dispatchEvent(new Event('click'))
    state.viewMode$.subscribe(mode => {
        expect(mode).toEqual((toggles[0] as any as FaIconToggleView<ViewMode>).value)
        done()
    })
})

