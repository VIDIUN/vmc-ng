import { Injectable } from '@angular/core';
import { AppPermissionsServiceBase } from '@vidiun-ng/mc-shared';
import { VMCPermissions } from './vmc-permissions';
import { VMCPermissionsRules } from 'app-shared/vmc-shared/vmc-permissions/vmc-permissions-rules';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Injectable()
export class VMCPermissionsService extends AppPermissionsServiceBase<VMCPermissions> {
    private _logger: VidiunLogger;
    private _restrictionsApplied = false;
    private _customPermissionNameToKeyMapping: { [name: string]: number} = {};
    get restrictionsApplied(): boolean {
        return this._restrictionsApplied;
    }

    constructor(logger: VidiunLogger) {
        super();
        this._logger = logger.subLogger('VMCPermissionsService');

        Object.keys(VMCPermissionsRules.customPermissionKeyToNameMapping).forEach((key) => {
            const customName = VMCPermissionsRules.customPermissionKeyToNameMapping[key] as any; // bypass typescript issue with implicit type checking
            this._customPermissionNameToKeyMapping[customName] = (<any>key);
        });
    }

    public getPermissionKeyByName(name: string): VMCPermissions {
        const customPermissionKey = this._customPermissionNameToKeyMapping[name];
        return customPermissionKey ? customPermissionKey : VMCPermissions[name];
    }

    public getPermissionNameByKey(key: VMCPermissions): string {
        const customPermissionName = VMCPermissionsRules.customPermissionKeyToNameMapping[key];
        return customPermissionName ? customPermissionName : VMCPermissions[key];
    }

    public getLinkedPermissionByKey(key: VMCPermissions): VMCPermissions {
        return VMCPermissionsRules.linkedPermissionMapping[key];
    }

    load(rawRolePermissionList: string[], rawPartnerPermissionList: string[]): void {

        super.flushPermissions();

        this._logger.info(`prepare user permissions set based on role permissions and partner permissions`);
        this._logger.trace('load()', () => ({
            rawRolePermissionList,
            rawPartnerPermissionList
        }));

        const rolePermissionList: Set<VMCPermissions> = new Set();
        const partnerPermissionList: Set<VMCPermissions> = new Set();
        const filteredRolePermissionList: Set<VMCPermissions> = new Set<VMCPermissions>();
        const linkedPermissionList: Set<VMCPermissions> = new Set<VMCPermissions>();
        let restrictionsApplied = false;

        const ignoredPartnerPermissionList: string[] = [];
        const ignoredRolePermissionList: string[] = [];

        // convert partner permission server value into app value
        rawPartnerPermissionList.forEach(rawPermission => {
            const permissionValue = this.getPermissionKeyByName(rawPermission);

            if (typeof permissionValue === 'undefined') {
                // ignoring partner permission since it is not in use by this app
                ignoredPartnerPermissionList.push(rawPermission);
            } else {
                partnerPermissionList.add(permissionValue);
            }
        });

        if (ignoredPartnerPermissionList.length) {
            this._logger.trace(`ignoring some partner permissions since they are not in use by this app.`,
                () => ({
                    permissions: ignoredPartnerPermissionList.join(',')
                }));
        }

        // convert role permission server value into app value
        rawRolePermissionList.forEach(rawPermission => {
            const permissionValue = this.getPermissionKeyByName(rawPermission)

            if (typeof permissionValue === 'undefined') {
                // ignoring role permission since it is not in use by this app
                ignoredRolePermissionList.push(rawPermission);
            } else {
                rolePermissionList.add(permissionValue);
            }
        });

        if (ignoredRolePermissionList.length) {
            this._logger.trace(`ignoring some role permissions since they are not in use by this app`, () => ({
                permissions: ignoredRolePermissionList.join(',')
            }));
        }

        // traverse on each role permission and add it to user permissions set if possible
        rolePermissionList.forEach(permission => {
            const requiredPermission = VMCPermissionsRules.requiredPermissionMapping[permission];
            const linkedPermission = VMCPermissionsRules.linkedPermissionMapping[permission];

            if (requiredPermission && !partnerPermissionList.has(requiredPermission)) {
                this._logger.info(`removing role permission '${VMCPermissions[permission]}' since a partner permission '${VMCPermissions[requiredPermission]}' is not available`);
                restrictionsApplied = true;
            } else {
                if (linkedPermission) {
                    // add the linked permission to a temporary storage
                    linkedPermissionList.add(linkedPermission);
                }

                // add the permission to the user permissions set
                filteredRolePermissionList.add(permission);
            }
        });

        // traverse on linked permissions and add to user permissions set if possible
        linkedPermissionList.forEach(linkedPermission => {

            if (!filteredRolePermissionList.has(linkedPermission)) {
                const requiredPermission = VMCPermissionsRules.requiredPermissionMapping[linkedPermission];

                if (!requiredPermission ||
                    (requiredPermission && partnerPermissionList.has(requiredPermission))) {
                    this._logger.info(`adding linked role permission '${VMCPermissions[linkedPermission]}'`);
                    filteredRolePermissionList.add(linkedPermission);
                }
            }
        });

        // Checking if can remove this loop since it appears that userRole/get returns them as well
        partnerPermissionList.forEach(permission => {
            filteredRolePermissionList.add(permission);
        });

        const userPermissions = Array.from(filteredRolePermissionList);
        super.loadPermissions(userPermissions);

        this._logger.info(`setting flag restrictionsApplied with value '${restrictionsApplied}'`);
        this._restrictionsApplied = restrictionsApplied;
    }

    isPermissionEnabled(permission: VMCPermissions): boolean {
        const requiredPermission = VMCPermissionsRules.requiredPermissionMapping[permission];
        return !requiredPermission || ((requiredPermission) && super.hasPermission(requiredPermission));
    }
}
