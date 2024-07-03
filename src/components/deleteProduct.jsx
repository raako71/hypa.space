import PropTypes from 'prop-types';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore/lite';
import { useEffect } from 'react';
import { auth, db } from '../firebase-config';

const DeleteProducts = ({
    userID,
    existingData,
    productNames,
    test,
    run
}) => {
    const existingproductTree = existingData?.productTree || {};
    const existingCategoryTree = existingData?.categoryTree || {};

    const deleteProduct = async (productName, productTree, test) => {
        const basePath = `users/${userID}/${productName}`;
        try {
            const userProductRef = doc(db, 'products', productName);
            const productSnapshot = await getDoc(userProductRef);
            let exists = 0;
            if (!productSnapshot.exists()) {
                console.log(`Product "${productName}" does not exist.`);
            } else exists = 1;
            if (!test && exists) {
                await deleteDoc(userProductRef);
                console.log(`Product "${productName}" successfully deleted.`);
                await deleteFiles(basePath); // Wait for deletion to complete
            }
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
        const modifiedTree = deleteProductNameFromTree(productTree, productName);
        return modifiedTree;
        //console.log("modifiedProductTree:", JSON.stringify(modifiedTree, null, 2));
    };

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

    const handleDeleteProducts = async (passedTree) => {
        let productTree = passedTree;
        for (const productName of productNames) {
            productTree = await deleteProduct(productName, productTree, test);
        }
        //console.log("modifiedProductTree:", JSON.stringify(productTree, null, 2));
        const categoryTree = pruneCategoryTree(existingCategoryTree, productTree);
        //console.log("categoryTree:", JSON.stringify(categoryTree, null, 2));
        const userDocRef = doc(db, 'users', userID);
        if (!test) await updateDoc(userDocRef, { productTree: productTree, categoryTree: categoryTree });
        //window.location.assign(location.origin + "/products");
    };

    const deleteFiles = async (path) => {
        try {
            const user = auth.currentUser;
            const idToken = await user.getIdToken();
            const url = 'https://us-central1-hypa-space.cloudfunctions.net/deleteFiles';
            const bodyData = {
                path: path,
            };
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(bodyData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return true;
                })
                .then(data => {
                    console.log('Response from Cloud Delete Function:', data);
                })
                .catch(error => {
                    console.error('Error calling Cloud Function:', error);
                });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function pruneCategoryTree(categoryTree, updatedProductTree) {
        function traverseAndUpdate(categoryNode, productNode) {
            for (let key in productNode) {
                if (!categoryNode[key]) {
                    // If the category or subcategory does not exist in the category tree, create it
                    categoryNode[key] = { name: key };
                }

                if (!productNode[key].products) {
                    // If there are subcategories, traverse recursively
                    traverseAndUpdate(categoryNode[key], productNode[key]);
                }
            }

            // Clean up any empty categories
            for (let key in categoryNode) {
                if (!productNode[key]) {
                    if (key != "name") {
                        delete categoryNode[key];
                    }
                }
            }
        }

        traverseAndUpdate(categoryTree, updatedProductTree);
        return categoryTree;
    }

    useEffect(() => {
        if (run) handleDeleteProducts(existingproductTree);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [run]);

    return (
        <div>
            {/* Component JSX */}
        </div>
    );
};

DeleteProducts.propTypes = {
    userID: PropTypes.string,
    existingData: PropTypes.object,
    productNames: PropTypes.array,
    test: PropTypes.bool,
    run: PropTypes.bool
};

export default DeleteProducts;
