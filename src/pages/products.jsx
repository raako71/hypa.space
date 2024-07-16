import { useEffect, useState } from 'react';
import CategorySelector from "../components/categorySelector";
import ProdBox from "../components/productBox"
import PropTypes from 'prop-types';

const Products = ({
    existingData,
    SessionID,
    StoreID
}) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(''); // New state variable
    const [categories, setCategories] = useState([]);
    const [loadingUserCategories, setLoadingUserCategories] = useState("");
    const [productArray, setProductArray] = useState(-1);
    const [productsDisplayed, setProductsDisplayed] = useState(1);
    const displayOptions = [10, 25, 50];
    const [currentPage, setCurrentPage] = useState(1);
    const [noOfPages, setNoOfPages] = useState(1);
    const [textColor, setTextColor] = useState('initial');
    const loadingTextStyle = { display: 'none' };
    const allowNewCats = false;
    const domain = location.origin;

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        if (productArray.length > 0) {
            const newNoOfPages = Math.ceil(productArray.length / productsDisplayed);
            setNoOfPages(newNoOfPages);
            setCurrentPage(1); // Reset to the first page when changing the number of products displayed
        }
    }, [productArray.length, productsDisplayed]);

    const setNumOfProducts = (e) => {
        setProductsDisplayed(parseInt(e.target.value, 10));
    };

    const renderProducts = () => {
        const startIndex = (currentPage - 1) * productsDisplayed + 1;
        const endIndex = Math.min(startIndex + productsDisplayed - 1, productArray.length);
        //console.log("SessionID = " + SessionID)
        return (
            <>
                {productArray.slice(startIndex - 1, endIndex).map((productName, index) => (
                    <ProdBox 
                    key={index} 
                    productNameUserID={productName || ''} 
                    domain={domain}
                    SessionID={SessionID}
                    />
                ))}
            </>
        );
    };
    
    
    

    // Function to fetch local categories data
    useEffect(() => {
        const fetchLocalCategories = async () => {            
            try {
                setLoadingUserCategories("Loading Categories.");
                setTextColor('red');
                // Fetch existing category tree from user document
                const productTree = existingData?.productTree || {};
                setCategories(productTree);
                setLoadingUserCategories("");
            } catch (error) {
                setLoadingUserCategories("Failed to load User Categories.");
                console.error('Error fetching local categories:', error);
            }
        };
        if (StoreID) {
            fetchLocalCategories(StoreID);
        }
    }, [StoreID, existingData]);




    useEffect(() => {
        const getProductChildrenArray = () => {
            let productsArray = [];

            if (selectedSubSubCategory !== '') {
                //console.log("Using sub-subcategory: " + selectedSubSubCategory)
                const subSubcategory = categories[selectedCategory]?.[selectedSubCategory]?.[selectedSubSubCategory];
                if (subSubcategory && subSubcategory.products) {
                    productsArray = Object.keys(subSubcategory.products);
                }
            } else if (selectedSubCategory !== '') {
                //console.log("Using subcategory: " + selectedSubCategory)
                const subcategory = categories[selectedCategory]?.[selectedSubCategory];
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
    }, [categories, selectedCategory, selectedSubCategory, selectedSubSubCategory]);

    useEffect(() => {
        // Set the default value for products displayed
        setProductsDisplayed(displayOptions[0]); // Set default to the first option
        //console.log("userID = " + SessionID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const Pagination = () => (
        <div style={{ textAlign: 'center', display: productArray.length === 0 ? 'none' : 'block' }}>
            {currentPage > 1 && (
                <button onClick={() => handlePageChange(1)}>«</button>
            )}
            {currentPage - 2 > 0 && (
                <button onClick={() => handlePageChange(currentPage - 2)}>
                    {currentPage - 2}
                </button>
            )}
            {currentPage - 1 > 0 && (
                <button onClick={() => handlePageChange(currentPage - 1)}>
                    {currentPage - 1}
                </button>
            )}
            <button disabled>{currentPage}</button>
            {currentPage + 1 <= noOfPages && (
                <button onClick={() => handlePageChange(currentPage + 1)}>
                    {currentPage + 1}
                </button>
            )}
            {currentPage + 2 <= noOfPages && (
                <button onClick={() => handlePageChange(currentPage + 2)}>
                    {currentPage + 2}
                </button>
            )}
            {currentPage < noOfPages && (
                <button onClick={() => handlePageChange(noOfPages)}>»</button>
            )}
        </div>
    );


    return (
        <div style={{ padding: '15px' }}>
            <h1>Products</h1>
            <p style={{ color: textColor }}>{loadingUserCategories}</p>
            <CategorySelector
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory} // pass category for existing product
                setSelectedSubCategory={setSelectedSubCategory}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubSubCategory={setSelectedSubSubCategory}
                selectedSubSubCategory={selectedSubSubCategory}
                loadingTextStyle={loadingTextStyle}
                allowNewCats={allowNewCats}
                existingData={existingData}
                userID={StoreID}
                userCats={true}
            />
            <h2>Products: {productArray.length}</h2>
            <p style={{ textAlign: 'center', display: productArray.length === 0 ? 'none' : 'block' }}>Show <select value={productsDisplayed} onChange={setNumOfProducts}>
                {displayOptions.map((option) => (
                    <option key={option} value={option}>
                        {`${option}`}
                    </option>
                ))}
            </select> Products</p>
            <Pagination />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {productArray === -1 ? null : (
                    productArray === 0 ? (
                        <div>No products found</div>
                    ) : (
                        renderProducts()
                    )
                )}
            </div>
            <Pagination />
        </div>
    );
};
Products.propTypes = {
    existingData: PropTypes.object,
    SessionID: PropTypes.string,
    StoreID: PropTypes.string
  };

export default Products;