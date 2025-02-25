import * as NativeReclaimInappModuleTypes from "./../specs/NativeInappRnSdk";

export interface ReclaimVerificationResponse extends NativeReclaimInappModuleTypes.Response {
    proofs: ReclaimResult.Proof[];
}

export namespace ReclaimResult {
    export interface Proof {
        identifier: string;
        signatures: string[];
        /**
         * A data associated with this [Proof].
         * The data type of this object is dynamic and can be any JSON serializable Javascript object.
         */
        publicData?: any | null;
        witnesses: WitnessData[];
        claimData: ProviderClaimData;
    }

    export const isProof = (value: Record<string, any>): value is Proof => {
        return typeof value === 'object' && value !== null && 'identifier' in value && 'signatures' in value && 'witnesses' in value;
    }

    export const asProofs = (proofs: Record<string, any>[]): Proof[] => {
        return proofs.filter(isProof);
    }

    export interface ProviderClaimData {
        owner: string;
        provider: string;
        /// int
        timestampS: number;
        /// int
        epoch: number;
        context: string;
        identifier: string;
        parameters: string;
    }

    export interface WitnessData {
        id: string;
        url: string;
    }
}
