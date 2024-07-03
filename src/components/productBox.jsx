import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ProdBox = ({ productNameUserID, userID, domain }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageUrlL, setImageUrlL] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [productUserID, setProductUserID] = useState('');

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



    const getProductInfo = async () => {
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
        const [, userIDVar] = productNameUserID.split('_');
        setProductUserID(userIDVar);
        getProductInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productNameUserID]);

    //cache images after loading
    useEffect(() => {
        if (imageUrl) {
            const img = new Image();
            img.src = imageUrl;
        }
    }, [imageUrl]);


    return (
        <div className="prodBox">
            <p>
            {productNameUserID}
            </p>
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
                render={{
                    buttonPrev: () => null,
                    buttonNext: () => null
                }}
            />
            {productInfo && (
                <>
                    <div className='text'>
                        <h2><a href={domain + "/product?productName=" + productNameUserID}>{productInfo.productName}</a></h2>
                        <p>Description: {trimDescription(productInfo.productDescription, 100)}</p>
                    </div>
                    {productUserID == userID && <div className="prEdit">
                        <a href={domain + "/newProduct?productName=" + productNameUserID}>edit</a></div>}
                </>
            )}

        </div>
    );
};

ProdBox.propTypes = {
    productNameUserID: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    userID: PropTypes.string
};

export default ProdBox;