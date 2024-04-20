import { useEffect, useState } from 'react';
import CategorySelector from "./categorySelector";
import { auth, db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore/lite';
import { onAuthStateChanged } from 'firebase/auth';
import ProdBox from "./productBox"

const Products = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(''); // New state variable
    const [categories, setCategories] = useState([]);
    const [loadingUserCategories, setLoadingUserCategories] = useState("");
    const [productArray, setProductArray] = useState([]);
    const [loadingTextStyle, setLoadingTextStyle] = useState({ display: 'none' });

    // Function to fetch local categories data
    useEffect(() => {
        const fetchLocalCategories = async (userID) => {
            let categoriesData = {};
            try {
                setLoadingUserCategories("Loading User Categories.");
                // Fetch existing category tree from user document
                const userDocRef = doc(db, 'users', userID);
                const userDocSnapshot = await getDoc(userDocRef);
                const existingData = userDocSnapshot.data();
                const productTree = existingData?.productTree || {};
                setCategories(productTree);
                setLoadingUserCategories("Loaded User Categories.");
            } catch (error) {
                setLoadingUserCategories("Failed to load User Categories.");
                console.error('Error fetching local categories:', error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userID = user.uid;
                fetchLocalCategories(userID);
            } else {
                console.log('User is logged out');
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const getProductChildrenArray = () => {
            let productsArray = [];

            if (selectedSubSubcategory !== '') {
                //console.log("Using sub-subcategory: " + selectedSubSubcategory)
                const subSubcategory = categories[selectedCategory]?.[selectedSubcategory]?.[selectedSubSubcategory];
                if (subSubcategory && subSubcategory.products) {
                    productsArray = Object.keys(subSubcategory.products);
                }
            } else if (selectedSubcategory !== '') {
                //console.log("Using subcategory: " + selectedSubcategory)
                const subcategory = categories[selectedCategory]?.[selectedSubcategory];
                if (subcategory && subcategory.products) {
                    productsArray = Object.keys(subcategory.products);
                }
                for (const subSubcategoryKey in subcategory) {
                    if (subSubcategoryKey === 'products') continue;
                    const subSubcategory = subcategory[subSubcategoryKey];
                    if (subSubcategory.products) {
                        productsArray.push(...Object.keys(subSubcategory.products));
                    }
                }
            } else if (selectedCategory !== '') {
                //console.log("Using category: " + selectedCategory);
                for (const subcategoryKey in categories[selectedCategory]) {
                    const subcategory = categories[selectedCategory][subcategoryKey];
                    if (subcategory.products) {
                        productsArray.push(...Object.keys(subcategory.products));
                    }
                    for (const subSubcategoryKey in subcategory) {
                        if (subSubcategoryKey === 'products') continue;
                        const subSubcategory = subcategory[subSubcategoryKey];
                        if (subSubcategory.products) {
                            productsArray.push(...Object.keys(subSubcategory.products));
                        }
                    }
                }
            }
            else {
                for (const categoryKey in categories) {
                    const category = categories[categoryKey];
                    for (const subcategoryKey in category) {
                        const subcategory = category[subcategoryKey];
                        if (subcategory.products) {
                            productsArray.push(...Object.keys(subcategory.products));
                        }
                        for (const subSubcategoryKey in subcategory) {
                            if (subSubcategoryKey === 'products') continue;
                            const subSubcategory = subcategory[subSubcategoryKey];
                            if (subSubcategory.products) {
                                productsArray.push(...Object.keys(subSubcategory.products));
                            }
                        }
                    }
                }
            }
            return productsArray;
        };


        // Update the state with the array of product names
        setProductArray(getProductChildrenArray());
    }, [categories, selectedCategory, selectedSubcategory, selectedSubSubcategory]);

    return (
        <div>
            <h1>Products</h1>
            <p style={{ margin: '8px' }}>{loadingUserCategories}
            </p>
            <CategorySelector
                setSelectedCategory={setSelectedCategory}
                setSelectedSubcategory={setSelectedSubcategory}
                setSelectedSubSubcategory={setSelectedSubSubcategory}
                loadingTextStyle={loadingTextStyle}
            />
            <h2>Product Names:</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', }}>
                {productArray.length > 0 ? (
                    productArray.map((productName, index) => (
                        <ProdBox key={index} productNameUserID={productName || ''} />
                    ))
                ) : (
                    <div>No products found</div>
                )}
            </div>
        </div>



    );

};

export default Products;