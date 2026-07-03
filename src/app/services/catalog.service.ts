import HTTP404Error from '@surefy/exceptions/HTTP404Error';
import HTTP400Error from '@surefy/exceptions/HTTP400Error';
import HTTP401Error from '@surefy/exceptions/HTTP401Error';
import { CreateGroupVariantsRequest } from '../interfaces/catalog.interface';
import { productGroups } from '../interfaces/catalog.interface';
import productGroupModel from '../models/productGroup.model';
import productVariantModel from '../models/productVariant.model';
import { uploadImage } from '@surefy/config/firebase.config';
import metaService from './meta.service';
import catalogRepository from '../repository/catalog.repository';

class catalogService {
     /**
     * POST /v1/catalog/groups
     * Create new group
     */
    async createGroup(data: productGroups) {
        const productGroup = await productGroupModel.create(data)
        return productGroup
    }

    /**
     * Create Group Variant
     */
    async createGroupVariants(
        groupId: string,
        catalog_id: string,
        variants: any[],
        images: Express.Multer.File[]
    ) {
        try {
            const createdVariants = await Promise.all(
                variants.map(async (variant: any) => {
                    if (!variant.data.image_url) {
                        const imageFile = images[variant.data.image_index];

                        if (!imageFile) {
                            throw new Error("Image File Missing");
                        }

                        const uploadImageUrl = await uploadImage(imageFile)
                        variant.data.image_url = uploadImageUrl;
                    }

                    delete variant.data.image_index;

                    const response = await metaService.createProductVariantBatch(catalog_id, variant)

                    if (!response?.handles) {
                        throw new Error(
                            response?.error?.message ||
                            "Meta Variant Upload Failed"
                        );
                    }

                    const savedVariant = await catalogRepository.createVariant({
                        ...variant.data,
                        retailer_id: variant.retailer_id,
                        product_group_id: groupId,
                        meta_status: "synced"
                    });

                    return {
                        savedVariant,
                        metaHandle: response.handles[0]
                    }
                })
            );

            return createdVariants
        } catch (error: any) {
            console.error('[Campaign Scheduler] Error checking scheduled campaigns:', error.message);
        }
    }

    /**
     * Sync Meta Catalog Variant
     */
    // async syncMetaCatalogVariant(catalogId:string){
    //     try{
    //         const catalogVariants = await metaService.syncCatalogVariant(catalogId)
    //         const syncProductVariant = await Promise.all(
    //             catalogVariants.map(async(variant:any)=>{
    //                 const existingProduct = await productVariantModel.findByRetailerId(variant.retailer_id)
    //                 const productCategory = await productGroupModel.findGroupByCategory(variant.category)
    //                 if(!existingProduct && productCategory){
    //                     const addGroupVariant = await productVariantModel.create({
    //                         product_group_id: productCategory.id,
    //                         name:existingProduct.name,
    //                         description:existingProduct.description,
    //                         color:existingProduct.color,
    //                         size:existingProduct.size,
    //                         price:existingProduct.price,
    //                         url:existingProduct.url,
    //                         condition:existingProduct.condition,
    //                         availability:existingProduct.avalability,
    //                         currency:existingProduct.currency
    //                     })
    //                 }

    //                 const updateGroupVariant = await productVariantModel.update(existingProduct.id,{
    //                         product_group_id: productCategory.id,
    //                         name:existingProduct.name,
    //                         description:existingProduct.description,
    //                         color:existingProduct.color,
    //                         size:existingProduct.size,
    //                         price:existingProduct.price,
    //                         url:existingProduct.url,
    //                         condition:existingProduct.condition,
    //                         availability:existingProduct.avalability,
    //                         currency:existingProduct.currency
    //                 })


    //             })
    //         )
    //         return syncProductVariant
    //     }catch(error:any){
    //         console.error('[Campaign Scheduler] Error checking scheduled campaigns:', error.message);
    //     }
    // }

    async syncMetaCatalogVariant(catalogId: string) {
    try {
        const catalogVariants = await metaService.syncCatalogVariant(catalogId);

        const results = await Promise.all(
            catalogVariants.map(async (variant: any) => {
                try {
                    const existingProduct =
                        await productVariantModel.findByRetailerId(
                            variant.retailer_id
                        );

                    const productCategory =
                        await productGroupModel.findGroupByCategory(
                            variant.category
                        );

                    if (!productCategory) {
                        return {
                            retailer_id: variant.retailer_id,
                            operation: "skipped",
                            reason: "Category not found",
                        };
                    }

                    if (!existingProduct) {
                        const created =
                            await productVariantModel.create({
                                product_group_id: productCategory.id,
                                retailer_id: variant.retailer_id,
                                name: variant.name,
                                description: variant.description,
                                color: variant.color,
                                size: variant.size,
                                price: variant.price,
                                url: variant.url,
                                condition: variant.condition,
                                availability: variant.availability,
                                currency: variant.currency,
                                brand:variant.brand,
                                image_url:variant.image_url,
                                category:variant.category
                            });

                        return {
                            retailer_id: variant.retailer_id,
                            operation: "created",
                            data: created,
                        };
                    }

                    const updated =
                        await productVariantModel.update(
                            existingProduct.id,
                            {
                                product_group_id: productCategory.id,
                                name: variant.name,
                                description: variant.description,
                                color: variant.color,
                                size: variant.size,
                                price: variant.price,
                                url: variant.url,
                                condition: variant.condition,
                                availability: variant.availability,
                                currency: variant.currency,
                                brand:variant.brand,
                                image_url:variant.image_url,
                                category:variant.category
                            }
                        );

                    return {
                        retailer_id: variant.retailer_id,
                        operation: "updated",
                        data: updated,
                    };
                } catch (error: any) {
                    return {
                        retailer_id: variant.retailer_id,
                        operation: "failed",
                        error: error.message,
                    };
                }
            })
        );

        return {
            total: catalogVariants.length,
            created: results.filter(r => r.operation === "created").length,
            updated: results.filter(r => r.operation === "updated").length,
            skipped: results.filter(r => r.operation === "skipped").length,
            failed: results.filter(r => r.operation === "failed").length,
            results,
        };
    } catch (error: any) {
        console.error(
            "[Campaign Scheduler] Error checking scheduled campaigns:",
            error.message
        );
        throw error;
    }
}

    /**
     * Get Catalog Groups
     */
    async getAllCatalogGroups(company_id:string,user_id:string){
        return await productGroupModel.getCatalogGroups(company_id,user_id)
    }

    /**
     * Get Group Variants
     */
    async getAllGroupVariants(company_id:string,user_id:string,groupId:string){
        return await productVariantModel.getGroupVariants(groupId)
    }

    /**
     * Update Group Variant
     */
    async updateGroupVariant(variantId:string){
        // return await 
    }

}

export default new catalogService();