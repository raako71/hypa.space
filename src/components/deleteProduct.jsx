import PropTypes from 'prop-types';
import { doc, deleteDoc  } from 'firebase/firestore/lite';
import { useState } from 'react';
import { db } from '../firebase-config';


const DeleteProducts = ({
    userID,
    existingData,
    productNames
}) => {
    const [modifiedProductTree, setModifiedProductTree] = useState("");
    const deleteProduct = async (productName, test) => {
        try {
            const userProductRef = doc(db, 'products', productName);
            if(!test){
                await deleteDoc(userProductRef);
                console.log(`Product "${productName}" successfully deleted.`);
            }
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
        const existingproductTree = existingData?.productTree || {};
        const modifiedTree = deleteProductNameFromTree(existingproductTree, productName);
        setModifiedProductTree(modifiedTree);
        console.log("modifiedProductTree:", JSON.stringify(modifiedTree, null, 2));
    }

    const deleteProductNameFromTree = (existingproductTree, productName) => {
        const traverseAndDelete = (node, parent, parentKey) => {
            for (const key in node) {
                if (key === 'products' && node[key][productName]) {
                    delete node[key][productName];
                    console.log(`Deleted product "${productName}" from ${parentKey}`);
                    // Check if products object is now empty
                    if (Object.keys(node[key]).length === 0) {
                        delete node[key];
                        console.log(`Deleted empty products from ${parentKey}`);
                        // Check if parent node (subcategory) is now empty
                        if (Object.keys(node).length === 0) {
                            delete parent[parentKey];
                            console.log(`Deleted empty ${parentKey}`);
                            // Check if parent of parent node (category) is now empty
                            if (Object.keys(parent).length === 0) {
                                console.log(`Deleted empty category`);
                            }
                        }
                    }
                    return existingproductTree; // Return the modified tree
                }
                if (typeof node[key] === 'object') {
                    traverseAndDelete(node[key], node, key);
                }
            }
        };
    
        traverseAndDelete(existingproductTree, null, null);
        return existingproductTree; // Return the modified tree after completing traversal
    };
    // For each productName in productNames array.
        // delete product from database.
        // update userProductTree.
        // delete images.
    // prune  categoryTree.
    // Update UserDoc
};

DeleteProducts.propTypes = {
    userID: PropTypes.string,
    existingData: PropTypes.object,
    productNames: PropTypes.array,
};

export default DeleteProducts;