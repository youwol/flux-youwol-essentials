/**
 * # Burger Menu
 * 
 * Burger-menu is the right menu in the [YouwolBannerView] expanded by a click with custom actions.
 * 
 * 
 * @module lib/top-banner/burger-menu.view
 */

import { VirtualDOM } from "@youwol/flux-view"

/**
 * Base class of item in the burger menu
 */
export class BurgerItem implements VirtualDOM {

    static ClassSelector = "burger-item"

    public readonly class = `row align-items-center fv-pointer fv-hover-text-focus px-3 ${BurgerItem.ClassSelector} `

    constructor({ withClasses }: { withClasses: string }) {

        this.class += withClasses
    }
}

/**
 * YouWol's dashboard link burger item
 */
export class DashboardLink extends BurgerItem {

    static ClassSelector = "dashboard-link"

    tag = "a"
    href = "/ui/dashboard"
    children = [
        {
            class: "col-sm",
            innerText: "Dashboard"
        }
    ]

    constructor() {
        super({ withClasses: DashboardLink.ClassSelector })
    }
}

/**
 * YouWol's workspace link burger item
 */
export class WorkspaceLink extends BurgerItem {

    static ClassSelector = "workspace-link"

    tag = "a"
    href = "/ui/workspace-explorer"
    children = [
        {
            class: "col-sm",
            innerText: "Workspace"
        }
    ]

    constructor() {
        super({ withClasses: WorkspaceLink.ClassSelector })
    }
}

/**
 * User settings burger item
 */
export class UserSettings extends BurgerItem {

    static ClassSelector = "user-settings"

    children = [
        {
            class: "col-sm",
            innerText: "Profile"
        }
    ]

    constructor() {
        super({ withClasses: UserSettings.ClassSelector })
    }
}

/**
 * Preferences burger item
 */
export class Preferences extends BurgerItem {

    static ClassSelector = "preferences"

    children = [
        {
            class: "col-sm",
            innerText: "Preferences"
        }
    ]

    constructor() {
        super({ withClasses: Preferences.ClassSelector })
    }
}

/**
 * Sign-out burgers item
 */
export class SignOut extends BurgerItem {

    static ClassSelector = "sign-out"

    children = [
        {
            class: "col-sm",
            innerText: "Sign-out",
            style: {
                whiteSpace: 'nowrap'
            }
        }
    ]

    constructor() {
        super({ withClasses: SignOut.ClassSelector })
    }
}

/**
 * A section in the burger menu
 */
export class BurgerMenuSection implements VirtualDOM {

    static ClassSelector = "burger-menu-section"
    public readonly class = `${BurgerMenuSection.ClassSelector}`

    public readonly children: VirtualDOM[]

    /**
     * @param parameters Constructor's parameters
     * @param parameters.items List of items in the section 
     */
    constructor(parameters: {
        items: BurgerItem[]
    }) {
        Object.assign(this, parameters)
        this.children = parameters.items
    }
}

/**
 * Burger menu of [[YouwolBannerView]]
 */
export class BurgerMenu implements VirtualDOM {

    static ClassSelector = "burger-menu"

    public readonly class = `py-3 px-1 ${BurgerMenu.ClassSelector}`
    public readonly children: VirtualDOM[]

    static separation = {
        tag: 'hr',
        class: 'w-100 fv-color-primary'
    }
    /**
     * @param parameters Constructor's parameters
     * @param parameters.sections List of sections in the menu
     */
    constructor(parameters: {
        sections: BurgerMenuSection[]
    }) {
        this.children = parameters.sections.map(section => {
            return [section, BurgerMenu.separation]
        })
            .flat()
            .concat([new SignOut()])
    }
}
