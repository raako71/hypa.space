import PropTypes from 'prop-types';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db } from '../firebase-config';

const DeleteProducts = ({
    userID,
    existingData,
    productNames,
    test,
    run,
    onOperationComplete,
    images
}) => {
    let productTree = existingData?.productTree || {};
    let catTree = existingData?.categoryTree || {};
    //const [operationComplete, setComplete] = useState(0);

    const deleteProductDoc = async (productName, test) => {
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
                if (images) await deleteFiles(basePath); // Wait for deletion to complete
            }
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
    };

    const handleDeleteProducts = async (test) => {
        if (test) console.log("testing");
        for (const productName of productNames) {
            console.log("deleting: " + productName)
            try {
                await deleteProductDoc(productName, test);
                deleteAProduct(productName, productTree);
                console.log(productName + " deleted successfully from Product Tree.");
            } catch (error) {
                console.error("Error deleting " + productName + ":", error);
                // Handle error as needed
            }
        }
        cleanProdTree(productTree);
        if(test) console.log("productTree:", JSON.stringify(productTree, null, 2));
        pruneCategoryTree(catTree, productTree);
        if(test) console.log("catTree:", JSON.stringify(catTree, null, 2));
        //setComplete(1);
        // window.location.assign(location.origin + "/products");
    };

    const deleteAProduct = (productID, ProductTree) => {
        let depth = 0;
        const deleteProduct = (currentObj, currentDepth) => {
            for (let key in currentObj) {
                if (key === productID) {
                    delete currentObj[key];
                    return;
                }
                if (typeof currentObj[key] === 'object') {
                    if (currentDepth > depth) {
                        depth = currentDepth;
                    }
                    deleteProduct(currentObj[key], currentDepth + 1);
                }
            }
        };
        deleteProduct(ProductTree, 1);
    }

    const cleanProdTree = (ProductTree) => {
        const pruneObject = (currentObj) => {
            const keys = Object.keys(currentObj);
            for (let key of keys) {
                if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                    pruneObject(currentObj[key]);
                    if (Object.keys(currentObj[key]).length === 0) {
                        delete currentObj[key];
                    }
                }
            }
        };
        pruneObject(ProductTree);
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
                    console.log("image deletion complete");
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
        const performDeletionAndUpdate = async () => {
            if (run) {
                try {
                    await handleDeleteProducts(test);
                    const userDocRef = doc(db, 'users', userID);
                    if (!test) {
                        await updateDoc(userDocRef, { productTree, categoryTree: catTree });
                        onOperationComplete(1);
                    } else {
                        onOperationComplete(0);
                    }
                } catch (error) {
                    console.error('Error handling deletion and update:', error);
                    // Handle error as needed
                }
            }
        };
        performDeletionAndUpdate();
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
    run: PropTypes.bool,
    onOperationComplete: PropTypes.func,
    images: PropTypes.bool,
};

export default DeleteProducts;
