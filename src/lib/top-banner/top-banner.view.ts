import { attr$, VirtualDOM } from "@youwol/flux-view";
import { BehaviorSubject } from "rxjs";


/**
 * Encapsulates YouWol's logo with optional badges.
 */
export class LogoView implements VirtualDOM {

    static ClassSelector = "LogoView"

    static url = '/api/assets-gateway/raw/package/QHlvdXdvbC9mbHV4LXlvdXdvbC1lc3NlbnRpYWxz/latest/assets/images/logo_YouWol_Platform_white.png'

    public readonly class = `d-flex my-auto ${LogoView.ClassSelector}`

    public readonly children: VirtualDOM[]
    public readonly badgesView?: VirtualDOM

    /**
     * 
     * @param parameters Constructor's parameters
     * @param parameters.badgesView if provided, insert the virtual DOM as badge view (see [[BadgeView]] for helpers)
     */
    constructor(parameters: { badgesView?: VirtualDOM }) {

        Object.assign(this, parameters)

        this.children = [
            {
                style: {
                    width: '30px',
                    overflow: 'hidden'
                },
                children: [{
                    tag: 'img',
                    class: `my-auto ${LogoView.ClassSelector}`,
                    src: LogoView.url,
                    style: { width: '200px' },
                }]
            },
            this.badgesView || {}
        ]
    }
}

/**
 * Define the burger menu of [[YouwolBannerView]]
 */
export class BurgerMenuView implements VirtualDOM {

    static ClassSelector = "burger-menu-view"

    public readonly showMenu$ = new BehaviorSubject(false)

    public readonly class = `my-auto position-relative burger-menu-icon-view ${BurgerMenuView.ClassSelector}`
    public readonly style = {
        zIndex: 10
    }
    children: VirtualDOM[]

    onclick: () => void
    onmouseleave: () => void

    public readonly contentView: VirtualDOM
    /**
     * 
     * @param parameters Constructor's parameters
     * @param parameters.contentView View displayed when the burger menu is expanded (see [[BurgerMenu]])
     * 
     */
    constructor(parameters: { contentView: VirtualDOM }) {

        Object.assign(this, parameters)

        let showMenu$ = new BehaviorSubject(false)

        this.onclick = () => showMenu$.next(!showMenu$.getValue())
        this.onmouseleave = () => showMenu$.next(false)

        this.children = [
            {
                class: 'fas fa-ellipsis-h fv-hover-text-focus fv-pointer p-3'
            },
            {
                class: attr$(
                    showMenu$,
                    (show) => show ? 'd-block' : 'd-none',
                    {
                        wrapper: (classes) => classes + ' position-absolute rounded border fv-color-primary fv-bg-background-alt content-container'
                    }
                ),
                style: {
                    right: '0px'
                },
                children: [
                    this.contentView
                ]
            }
        ]
    }

}
/**
 * The YouWol top banner
 * 
 * YouWol top banner includes 3 parts, from left to right:
 * *    the YouWol logo with some optional badges ([[BadgeView]])
 * *    a main content: the actions the consuming application wants to expose (some helpers e.g. [[ComboTogglesView]])
 * *    a burger menu with common actions ([[BurgerMenu]])
 * 
 */
export class YouwolBannerView implements VirtualDOM {

    static ClassSelector = "youwol-banner-view"

    public readonly class = `d-flex w-100 fv-text-primary justify-content-between align-self-center  px-3  border-bottom ${YouwolBannerView.ClassSelector}`
    public readonly children: Array<VirtualDOM>

    public readonly badgesView?: VirtualDOM
    public readonly customActionsView?: VirtualDOM
    public readonly burgerMenuView?: VirtualDOM

    /**
     * @params params Parameters
     * @param params.badgesView definition of the badges, see [[BadgeView]]
     * @param params.customActionsView definition of the custom actions of the app
     * @param params.burgerMenuView definition of the burger menu
     */
    constructor(params: {
        badgesView?: VirtualDOM,
        customActionsView?: VirtualDOM,
        burgerMenuView?: VirtualDOM
    }) {
        Object.assign(this, params)
        this.children = [
            new LogoView({ badgesView: this.badgesView }),
            this.customActionsView,
            new BurgerMenuView({ contentView: this.burgerMenuView })
        ]
    }
}
