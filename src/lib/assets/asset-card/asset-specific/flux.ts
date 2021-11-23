import { VirtualDOM } from "@youwol/flux-view"
import { map, mergeMap, take } from "rxjs/operators"
import { Asset, AssetsGatewayClient, DefaultDriveResponse } from "../../.."
import { ButtonPermissionView } from "../.."




export class FluxProjectActionsView implements VirtualDOM {

    static ClassSelector = "flux-project-actions-view"
    class = `${FluxProjectActionsView.ClassSelector} d-flex w-100 justify-content-around`
    children: VirtualDOM

    constructor(asset: Asset) {

        let btnPlay = new ButtonPermissionView({ name: 'Play', withClass: "", enabled: asset.permissions.read })
        btnPlay.state.click$.subscribe(() => {
            if (parent.window['@youwol/os']) {
                let app = parent.window['@youwol/os'].createInstance({
                    title: asset.name,
                    icon: 'fas fa-play',
                    appURL: `/ui/flux-runner/?id=${asset.rawId}`
                })
                parent.window['@youwol/os'].focus(app)
                return
            }
            window.location.href = `/ui/flux-runner/?id=${asset.rawId}`
        })

        let btnEdit = new ButtonPermissionView({ name: 'Build', withClass: "", enabled: asset.permissions.write })
        btnEdit.state.click$.subscribe(() => {
            if (parent.window['@youwol/os']) {
                let app = parent.window['@youwol/os'].createInstance({
                    title: asset.name,
                    icon: 'fas fa-play',
                    appURL: `/ui/flux-builder/?id=${asset.rawId}`
                })
                parent.window['@youwol/os'].focus(app)
                return
            }
            window.location.href = `/ui/flux-builder/?id=${asset.rawId}`
        })

        let btnDownloadLink = new ButtonPermissionView({ name: 'Download link', withClass: "", enabled: asset.permissions.read })
        btnDownloadLink.state.click$.pipe(
            take(1),
            mergeMap(() => {
                return new AssetsGatewayClient().getDefaultUserDrive()
            }),
            mergeMap((drive: DefaultDriveResponse) => {
                return new AssetsGatewayClient().borrowItem$(asset.assetId, drive.downloadFolderId).pipe(
                    map((item) => [item, drive])
                )
            })
        ).subscribe(([item, drive]: [any, DefaultDriveResponse]) => {
            if (parent.window['@youwol/os']) {
                let youwolOS = parent.window['@youwol/os']
                let tree = youwolOS.groupsTree[item.groupId]
                let node = new youwolOS.Nodes.ItemNode({
                    id: item.treeId, groupId: item.groupId, driveId: item.driveId, name: item.name,
                    assetId: item.assetId, rawId: item.rawId, borrowed: true,
                    icon: 'fas fa-play'
                })
                try {
                    tree.addChild(drive.downloadFolderId, node)
                }
                catch (e) {
                    console.log("Home's download node not already resolved", e)
                }
                tree.getNode(drive.downloadFolderId).events$.next({ type: 'item-added' })
                /*
                youwolOS.currentFolder$.pipe(
                    take(1)
                ).subscribe(({ folder }) => {
                    if (folder.id != drive.downloadFolderId) {
                        console.log("Notification")
                    }
                })*/
            }
        })
        let btnCopy = new ButtonPermissionView({ name: 'Download copy', withClass: "", enabled: asset.permissions.read })

        this.children = [
            btnPlay,
            btnEdit,
            btnDownloadLink,
            btnCopy
        ]
    }
}
