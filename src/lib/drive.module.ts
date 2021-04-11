
import { Flux, BuilderView, ModuleFlow, Pipe, Schema, Property, Context, ModuleError } from "@youwol/flux-core"
import { AssetsGatewayClient } from "./assets-gateway-client";
import { Drive } from "./drive";
import { pack } from './main';

// Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
let svgIcon = `
<path xmlns="http://www.w3.org/2000/svg" d="M108.73,73.749v2.422c0,6.065-4.935,11-11,11h-7.775V62.749h7.775C103.796,62.749,108.73,67.684,108.73,73.749z   M143.178,62.749h-7.775v24.422h7.775c6.065,0,11-4.935,11-11v-2.422C154.178,67.684,149.244,62.749,143.178,62.749z   M186.761,15.352v144.456v9.125v14.4c0,8.465-6.887,15.352-15.352,15.352H27.277c-8.465,0-15.352-6.887-15.352-15.352v-14.4v-9.125  V15.352C11.925,6.887,18.811,0,27.277,0h144.132C179.874,0,186.761,6.887,186.761,15.352z M125.404,92.171c0,2.761,2.239,5,5,5  h12.775c11.58,0,21-9.42,21-21v-2.422c0-11.58-9.42-21-21-21h-12.775c-2.761,0-5,2.239-5,5V92.171z M79.955,92.171  c0,2.761,2.239,5,5,5H97.73c11.58,0,21-9.42,21-21v-2.422c0-11.58-9.42-21-21-21H84.955c-2.761,0-5,2.239-5,5V92.171z   M34.507,92.171c0,2.761,2.239,5,5,5s5-2.239,5-5V79.96h18.775v12.211c0,2.761,2.239,5,5,5s5-2.239,5-5V57.749c0-2.761-2.239-5-5-5  s-5,2.239-5,5V69.96H44.507V57.749c0-2.761-2.239-5-5-5s-5,2.239-5,5V92.171z M176.761,159.808c0-2.951-2.401-5.352-5.352-5.352  H27.277c-2.951,0-5.352,2.401-5.352,5.352v23.525c0,2.951,2.401,5.352,5.352,5.352h144.132c2.951,0,5.352-2.401,5.352-5.352V159.808  z M41.086,166.571h-0.254c-2.761,0-5,2.239-5,5s2.239,5,5,5h0.254c2.761,0,5-2.239,5-5S43.847,166.571,41.086,166.571z   M159.542,166.571h-12.326c-2.761,0-5,2.239-5,5s2.239,5,5,5h12.326c2.761,0,5-2.239,5-5S162.303,166.571,159.542,166.571z"/>
`

/**
 * ## Abstract
 * 
 * The YouWol's drive module allows to access your resources loaded in YouWol.
 * 
 * Documentation about the logic part as well as the inputs/outputs is included [[ModuleEditor.Module | here]].
 * 
 * The configuration of the module is described [[ModuleEditor.PersistentData|here]]
 */
export namespace ModuleYouwolDrive {

    /*
    The configuration of the editor module allows to tune the rendering of the displayed content.
    */
    @Schema({
        pack: pack,
        description: "Persistent Data of YouWol's drive module",
        namespace: ModuleYouwolDrive,
    })
    export class PersistentData {

         /**
         * Name of the group containing the YouWol drive (as displayed in the workspace explorer).
         */
          @Property({ 
            description: "Name of the group containing the YouWol drive"
        })
        readonly ywGroup: string


         /**
         * Name of the drive (as displayed in the workspace explorer).
         */
          @Property({ 
            description: "Name of the drive (as displayed in the workspace explorer)"
        })
        readonly ywDrive: string


        /**
         * The displayed name of the drive.
         */
         @Property({ 
            description: "displayed name of the drive."
        })
        readonly driveName: string


        constructor({ ywGroup, ywDrive, driveName }:
            {   ywGroup?: string,
                ywDrive?: string,
                driveName? : string
            } = {}) {
                this.ywGroup =  ywGroup != undefined ? ywGroup : "youwol-users"
                this.ywDrive =  ywDrive != undefined ? ywDrive : "assets"
                this.driveName = driveName != undefined ? driveName : 'YouWol drive'
        }
    }

    
    /**
     *  ## Abstract
     * 
     * The YouWol's drive module is used to access your resources loaded in YouWol,
     * it points to an exposed folder (see [[PersistentData]])
     * 
     * Typical use-cases include the ability of your application to read/write data to your
     * YouWol workspace. Typical downstream modules can be the modules included in the 
     * [flux-files](/api/assets-gateway/raw/package/QHlvdXdvbC9mbHV4LWZpbGVz/libraries/youwol/flux-files/0.0.0/dist/docs/index.html) 
     * module-box.
     *
     * A couple examples of flux applications can be found [here](../index.html).
     * 
     * ## Inputs/Outputs
     * 
     * The module features one output: it is emitting the drive entity. The drive allow to access
     * the data in your workpsace under *group/drive_name* where group and drive_name are the property
     * defined in [[PersistentData]].
     * 
     * ## Helpers
     * 
     * Some [[ModuleYouwolDrive.helpers]] functions are provided to use within an adaptor.
     * 
     */
    @Flux({
        pack: pack,
        namespace: ModuleYouwolDrive,
        id: "YouwolDrive",
        displayName: "YouWol drive",
        description: "Drive to access your YouWol's workspace data",
        resources: {
            'technical doc': `${pack.urlCDN}/dist/docs/modules/moduleyouwoldrive.html`,
        }
    })
    @BuilderView({
        namespace: ModuleYouwolDrive,
        icon: svgIcon
    })
    export class Module extends ModuleFlow {
        
        /**
         * Output pipe of the module: convey a YouWol's drive
         */
        public readonly drive$ : Pipe<Drive>


        constructor(params) {
            super(params)

            let context = new Context('contructor', {}, this.logChannels )

            this.addJournal({
                title: `Reporting @module construction`,
                entryPoint: context
            })

            this.drive$ = this.addOutput({id:"drive"} )
            let configuration = this.getConfiguration<PersistentData>()
            let groupName = configuration.ywGroup
            if(groupName[0] != '/' )
                groupName = '/' + groupName

            let driveName = configuration.ywDrive
            context.info(
                `YouWol's group: ${groupName}; drive name: ${driveName}`,
                {configuration}
            )

            AssetsGatewayClient.getDrive(groupName, driveName)
            .subscribe( 
                (drive) => {
                    this.drive$.next({data:new Drive(drive.driveId, drive.name, true ), context})
                    context.end()
                },
                (error) => {
                    context.error(
                        new ModuleError(
                            this, 
                            "Failed to retrieve the drive at given (group name,drive name), make sure the drive exists in your workspace"
                        ),
                        { groupName, driveName }
                    )
                    context.end()
                })
        }
    }
    
}