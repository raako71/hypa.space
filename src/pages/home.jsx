import { useEffect, useState } from 'react';
import StoreBox from '../components/StoreBox';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Home = () => {
    const [sortedKeys, setSortedKeys] = useState(-1);
    const [stores, setStoreData] = useState([]);
    const [noOfPages, setNoOfPages] = useState(1);
    const [loading, setLoading] = useState("");

    const [productsDisplayed, setProductsDisplayed] = useState(10);
    const displayOptions = [10, 25, 50];

    const listStores = async () => {
        try {
            const firestore = getFirestore();
            const usersDocRef = doc(firestore, 'users', 'stores');
            const usersDocSnapshot = await getDoc(usersDocRef);
            if (usersDocSnapshot.exists()) {
                const storesData = usersDocSnapshot.data();
                setStoreData(storesData);
                const sortedKeys = Object.keys(storesData).sort();
                setSortedKeys(sortedKeys);
            } else {
                console.error("failed to retrieve stores data")
                return;
            }
        } catch (error) {
            console.error('Error fetching product info:', error);
        }
    };
    useEffect(() => {
        listStores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const setNumOfProducts = (e) => {
        setProductsDisplayed(parseInt(e.target.value, 10));
    };
    useEffect(() => {
        if (sortedKeys.length > 0) {
            const newNoOfPages = Math.ceil(sortedKeys.length / productsDisplayed);
            setNoOfPages(newNoOfPages);
            setCurrentPage(1); // Reset to the first page when changing the number of products displayed
        }
    }, [sortedKeys.length, productsDisplayed]);

    const Pagination = () => (
        <div style={{ textAlign: 'center', display: sortedKeys.length === 0 ? 'none' : 'block' }}>
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

    const renderProducts = () => {
        if (!Array.isArray(sortedKeys)) {
            return;
        }
        const startIndex = (currentPage - 1) * productsDisplayed + 1;
        const endIndex = Math.min(startIndex + productsDisplayed - 1, sortedKeys.length);
        return (
            <>
                {sortedKeys.slice(startIndex - 1, endIndex).map((storeName, index) => {
                    const [userID, storeNameValue] = stores[storeName];
                    return (
                        <StoreBox
                            key={index}
                            userName={storeName}
                            userID={userID}
                            storeName={storeNameValue}
                        />
                    );
                })}
            </>
        );
    };

    useEffect(() => {
        if (sortedKeys === -1) {
            setLoading("Loading...");
        } else if (sortedKeys.length === 0) {
            setLoading("No Stores found");
        } else {
            setLoading("");
        }
    }, [sortedKeys]);

    return (
        <>
            <div className="article">
                <h1>Store Index</h1>
            </div>
            <Pagination />
            <p style={{ textAlign: 'center' }}>{loading}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {loading === "" && renderProducts()}
            </div>
            <Pagination />
            <p style={{ textAlign: 'center', display: sortedKeys.length === 0 ? 'none' : 'block' }}>Show <select value={productsDisplayed} onChange={setNumOfProducts}>
                {displayOptions.map((option) => (
                    <option key={option} value={option}>
                        {`${option}`}
                    </option>
                ))}
            </select> stores</p>
            <br />
        </>
    )
}

export default Home