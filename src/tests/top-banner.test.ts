import { render, VirtualDOM } from "@youwol/flux-view"
import { BehaviorSubject, of } from "rxjs"
import { tap } from "rxjs/operators"

import {
    ComboTogglesView, FaIconToggleView, YouwolBannerView, YouwolBannerState,
    MenuItem, MenuSection, defaultUserMenu, defaultYouWolMenu, LoginView, SettingsMenuItem
} from ".."

import { LockerBadge } from "../lib/top-banner/badges"
import { UserMenuView } from "../lib/top-banner/user-menu.view"
import { YouwolMenuView } from "../lib/top-banner/youwol-menu.view"

class MockCodeMirror {
    content: string
    constructor(elem, conf) {
        this.content = conf.value
    }
    setValue(content) { this.content = content }
    getValue() { return this.content }
}
class Request { }
(window as any)['Request'] = Request;
(window as any)['fetch'] = () => { return Promise.resolve({ status: 200 }) }


export enum ViewMode {
    renderOnly = 'renderOnly',
    editOnly = 'editOnly',
    simultaneous = 'simultaneous'
}
export class TopBannerState extends YouwolBannerState {

    public readonly viewMode$ = new BehaviorSubject<ViewMode>(ViewMode.renderOnly)
    public readonly readonly = true
    constructor() {
        super({
            cmEditorModule$: new BehaviorSubject({}).pipe(
                tap(() => {
                    window['CodeMirror'] = (elem, conf) => { return new MockCodeMirror(elem, conf) }
                })
            )
        })
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

    constructor(params: { state: YouwolBannerState }) {

        Object.assign(this, params)
        let viewModeCombo = new ComboTogglesView<ViewMode, YouwolBannerState>({
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

    constructor({ state, signedIn }: { state: TopBannerState, signedIn: boolean }) {
        super({
            state,
            badgesView: new LockerBadge({
                locked$: of(state.readonly)
            }),
            customActionsView: new CustomActionsView({ state }),
            userMenuView: defaultUserMenu(state),
            youwolMenuView: defaultYouWolMenu(state),
            signedIn$: new BehaviorSubject<boolean>(signedIn)
        })
    }
}



test('rendering: what should be displayed is displayed', (done) => {


    let state = new TopBannerState()
    let bannerView = new BannerView({ state, signedIn: true })
    document.body.appendChild(render(bannerView))

    let expectedDisplayed = [
        YouwolBannerView.ClassSelector,
        CustomActionsView.ClassSelector,
        ViewMode.editOnly,
        ViewMode.renderOnly,
        ViewMode.simultaneous,
        YouwolMenuView.ClassSelector,
        LockerBadge.ClassSelector
    ]
    expectedDisplayed.forEach(selector => {

        let elem = document.querySelector("." + selector)
        expect(elem).toBeTruthy()
        done()
    })
})


test('rendering: open user menu', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView({ state, signedIn: true })
    document.body.appendChild(render(bannerView))

    let userMenuView = document.querySelector("." + UserMenuView.ClassSelector) as any as (UserMenuView & HTMLDivElement)

    userMenuView.dispatchEvent(new Event("click", { bubbles: true }))
    let sections = Array.from(document.querySelectorAll("." + MenuSection.ClassSelector))
    expect(sections.length).toEqual(2)

    let burgerItems = Array.from(document.querySelectorAll("." + MenuItem.ClassSelector))

    expect(burgerItems.length).toEqual(3);
    userMenuView.onmouseleave()
    sections = Array.from(document.querySelectorAll("." + MenuSection.ClassSelector))

    expect(sections.length).toEqual(0)
    done()
})


test('rendering: open youwol menu', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView({ state, signedIn: true })
    document.body.appendChild(render(bannerView))

    let youwolMenuView = document.querySelector("." + YouwolMenuView.ClassSelector) as any as (YouwolMenuView & HTMLDivElement)

    youwolMenuView.dispatchEvent(new Event("click", { bubbles: true }))
    let sections = Array.from(document.querySelectorAll("." + MenuSection.ClassSelector))
    expect(sections.length).toEqual(2)

    let burgerItems = Array.from(document.querySelectorAll("." + MenuItem.ClassSelector))

    expect(burgerItems.length).toEqual(3);
    youwolMenuView.onmouseleave()
    sections = Array.from(document.querySelectorAll("." + MenuSection.ClassSelector))

    expect(sections.length).toEqual(0)
    done()
})



test('rendering: open user settings', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView({ state, signedIn: true })
    document.body.appendChild(render(bannerView))

    let youwolMenuView = document.querySelector("." + UserMenuView.ClassSelector) as any as (UserMenuView & HTMLDivElement)

    youwolMenuView.dispatchEvent(new Event("click", { bubbles: true }))
    let settingsView = document.querySelector("." + SettingsMenuItem.ClassSelector)
    settingsView.dispatchEvent(new Event("click", { bubbles: true }))

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    done()
})


test('combo toggle', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView({ state, signedIn: true })
    document.body.appendChild(render(bannerView))

    let toggles = Array.from(document.querySelectorAll("." + FaIconToggleView.ClassSelector));
    expect(toggles.length).toEqual(3);
    toggles[0].dispatchEvent(new Event('click'))
    state.viewMode$.subscribe(mode => {
        expect(mode).toEqual((toggles[0] as any as FaIconToggleView<ViewMode>).value)
        done()
    })
})


test('not signed-in', (done) => {
    document.body.innerHTML = ""
    let state = new TopBannerState()
    let bannerView = new BannerView({ state, signedIn: false })
    document.body.appendChild(render(bannerView))

    let login = document.querySelector("." + LoginView.ClassSelector)
    expect(login).toBeTruthy()
    done()
})
