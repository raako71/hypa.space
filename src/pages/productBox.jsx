import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ProdBox = ({ productNameUserID }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageUrlL, setImageUrlL] = useState('');
    const [productInfo, setProductInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const openLightbox = () => {
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const getImageByName = async (userID) => {
        // Construct the full path to the image
        const imagePath = `users/${userID}/${productNameUserID}/S0`;
        const imagePathL = `users/${userID}/${productNameUserID}/L0`;

        // Get the download URL for the image
        const storage = getStorage();
        const storageL = getStorage();
        const imageRef = ref(storage, imagePath);
        const imageRefL = ref(storageL, imagePathL);
        const url = await getDownloadURL(imageRef);
        const urlL = await getDownloadURL(imageRefL);

        setImageUrl(url);
        setImageUrlL(urlL);
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
        getImageByName(userID);
        getProductInfo(productNameUserID);
    }, [productNameUserID]);

    return (
        <div className="prodBox">
            <div className="image-container" onClick={openLightbox}>
                {imageUrl && <img src={imageUrl} alt="Product Image" style={{ cursor: 'pointer' }}/>}
            </div>
            {/* Lightbox component */}
            <Lightbox
                open={isOpen}
                close={closeLightbox}
                slides={[
                    { src: imageUrlL }
                ]}
            />
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
