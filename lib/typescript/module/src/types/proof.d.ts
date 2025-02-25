import * as NativeReclaimInappModuleTypes from "./../specs/NativeInappRnSdk";
export interface ReclaimVerificationResponse extends NativeReclaimInappModuleTypes.Response {
    proofs: ReclaimResult.Proof[];
}
export declare namespace ReclaimResult {
    interface Proof {
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
    const isProof: (value: Record<string, any>) => value is Proof;
    const asProofs: (proofs: Record<string, any>[]) => Proof[];
    interface ProviderClaimData {
        owner: string;
        provider: string;
        timestampS: number;
        epoch: number;
        context: string;
        identifier: string;
        parameters: string;
    }
    interface WitnessData {
        id: string;
        url: string;
    }
}
//# sourceMappingURL=proof.d.ts.map