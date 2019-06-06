
import { VMCPermissions } from 'app-shared/vmc-shared/vmc-permissions';

export interface PartnerInfo {
    partnerId: number;
    name: string;
    partnerPackage: PartnerPackageTypes;
    landingPage: string;
    adultContent: boolean;
    publisherEnvironmentType: number;
}

export enum PartnerPackageTypes {
    PartnerPackageFree = 1,
    PartnerPackagePaid = 2,
    PartnerPackageDeveloper = 100
}


export interface AppUser {
    vs: string;
    id: string;
    partnerId: number;
    fullName: string;
    firstName: string;
    lastName: string;
    partnerInfo: PartnerInfo;
    createdAt: Date;
}

