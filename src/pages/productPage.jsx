import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ProdBox = ({ productNameUserID }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageUrlL, setImageUrlL] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const openLightbox = () => {
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const getImageByName = async (userID, hasImages) => {
        // Construct the full path to the image
        const imagePath = `users/${userID}/${productNameUserID}/S0`;
        const imagePathL = `users/${userID}/${productNameUserID}/L0`;

        let imageRef, imageRefL;
        setImageUrl("/placeHolder.jpg");

        if (hasImages) {
            const storage = getStorage();
            imageRef = ref(storage, imagePath);
            imageRefL = ref(storage, imagePathL);
            try {
                const url = await getDownloadURL(imageRef);
                setImageUrl(url);
            } catch (error) {
                console.error(error);
            }
            try {
                const urlL = await getDownloadURL(imageRefL);
                setImageUrlL(urlL);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    const getProductInfo = async (productNameUserID) => {
        try {
            const firestore = getFirestore();
            const productDocRef = doc(firestore, 'products', productNameUserID);
            const productSnapshot = await getDoc(productDocRef);
            if (productSnapshot.exists()) {
                const productData = productSnapshot.data();
                setProductInfo(productData);
                if (productData) {
                    const [, userID] = productNameUserID.split('_');
                    getImageByName(userID, productData.images);
                }
            } else {
                console.log('Product document not found.');
            }
        } catch (error) {
            console.error('Error fetching product info:', error);
            setTimeout(() => handleReload(), 3000);
        }
    };

    useEffect(() => {
        // Extract the user ID from the productNameUserID
        const [, userID] = productNameUserID.split('_');
        getProductInfo(productNameUserID);
    }, [productNameUserID]);

    // Clear timeout on component unmount
    useEffect(() => {
        return () => {
            clearTimeout();
        };
    }, []);


    // Function to trim description to a certain length
    const trimDescription = (description, maxLength) => {
        if (description.length > maxLength) {
            return description.substring(0, maxLength) + '...';
        }
        return description;
    };


    return (
        <div id="mainProductDiv">
            {productInfo && (
                <div className='text'>
                    <h2>{productInfo.productName}</h2>
                    <p>Description: {trimDescription(productInfo.productDescription, 100)}</p>
                    {productInfo.variations.length > 0 && (
                        <div>
                            {productInfo.variations.map((variation, index) => (
                                <div key={index}>
                                    <p>{variation.name}:&nbsp;
                                    <select>
                                        {variation.types.map((type, typeIndex) => (
                                            <option key={typeIndex}>{type}</option>
                                        ))}
                                    </select>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {productInfo && (
                <div className="image-container" onClick={productInfo.images ? openLightbox : undefined}>
                    {imageUrl && <img src={imageUrl} alt="Product Image" style={{ cursor: productInfo.images ? 'pointer' : 'default' }} />}
                </div>
            )}
            {/* Lightbox component */}
            <Lightbox
                open={isOpen}
                close={closeLightbox}
                slides={[
                    { src: imageUrlL }
                ]}
            />
        </div>
    );
};

ProdBox.propTypes = {
    productNameUserID: PropTypes.string.isRequired,
};

export default ProdBox;
