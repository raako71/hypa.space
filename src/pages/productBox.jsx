import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';

const ProdBox = ({ productNameUserID }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [productInfo, setProductInfo] = useState(null);

    const getImageByName = async (imageName, userID) => {
        // Construct the full path to the image
        const imagePath = `users/${userID}/${productNameUserID}/${imageName}`;

        // Get the download URL for the image
        const storage = getStorage();
        const imageRef = ref(storage, imagePath);
        const url = await getDownloadURL(imageRef);

        setImageUrl(url);
    };

    const getProductInfo = async (productNameUserID) => {
        try {
            const firestore = getFirestore();
            const productDocRef = doc(firestore, 'products', productNameUserID);
            const productSnapshot = await getDoc(productDocRef);
            if (productSnapshot.exists()) {
                setProductInfo(productSnapshot.data());
            } else {
                console.log('Product document not found.');
            }
        } catch (error) {
            console.error('Error fetching product info:', error);
        }
    };

    // Function to trim description to a certain length
    const trimDescription = (description, maxLength) => {
        if (description.length > maxLength) {
            return description.substring(0, maxLength) + '...';
        }
        return description;
    };

    useEffect(() => {
        // Extract the user ID from the productNameUserID
        const [, userID] = productNameUserID.split('_');
        getImageByName('L0', userID);
        getProductInfo(productNameUserID);
    }, [productNameUserID]);

    return (
        <div className="prodBox">
            {imageUrl && <img src={imageUrl} alt="Product Image" />}
            {productInfo && (
                <div className='text'>
                    <h2>{productInfo.productName}</h2>
                    <p>Description: {trimDescription(productInfo.productDescription, 100)}</p>
                </div>
            )}
        </div>
    );
};

ProdBox.propTypes = {
    productNameUserID: PropTypes.string.isRequired,
};

export default ProdBox;
