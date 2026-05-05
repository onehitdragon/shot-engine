import { AssetProperty, AssetType } from "./asset"

export namespace AssetManager{
    export type Config = {
        assetDir: string,
        assetDefaultDir: string,
        assetGenerateDir: string,
        dbFilePath: string,
    }
    export type AssetInfo = {
        uuid: string,
        type: AssetType,
        name: string,
        property: AssetProperty.AssetProperty,
        allowModify: boolean
    }
}
