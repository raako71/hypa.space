import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL, getMetadata } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ProdBox = ({ productNameUserID }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageUrlL, setImageUrlL] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([{ key: 'S0', src: '/placeHolder.jpg', alt: 'Default Img' }]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const openLightbox = (index) => {
        setIsOpen(true);
        setSelectedImageIndex(index);
    };


    const closeLightbox = () => {
        setIsOpen(false);
    };

    const indexImages = async (userID, hasImages) => {
        const basePath = `users/${userID}/${productNameUserID}`;

        let imageUrls = [];

        if (hasImages) {
            const storage = getStorage();
            let totalImages = 0;
            for (let i = 0; i < 10; i++) {
                const imagePathS = `${basePath}/S${i}`;
                try {
                    const urlS = await getDownloadURL(ref(storage, imagePathS));
                    const imgKey = `S${i}`;
                    imageUrls.push({ key: imgKey, src: urlS, alt: `Small Image ${i}`, width: "350", height: "350" });
                    setImages([...imageUrls]);
                    totalImages += 1;
                } catch (error) {
                    break;
                }
            }
            for (let i = 0; i < totalImages; i++) {
                const imagePathL = `${basePath}/L${i}`;
                try {
                    const urlL = await getDownloadURL(ref(storage, imagePathL));
                    const smallImageKey = `S${i}`;
                    const smallImageIndex = imageUrls.findIndex(image => image.key === smallImageKey);
                    if (smallImageIndex !== -1) {
                        const srcSet = [
                            { src: imageUrls[smallImageIndex].src, width: imageUrls[smallImageIndex].width, height: imageUrls[smallImageIndex].height },
                            { src: urlL, width: "1000", height: "1000" },
                        ];
                        imageUrls[smallImageIndex].srcSet = srcSet;
                    }
                } catch (error) {
                    console.error(error);
                    break;
                }
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
                    indexImages(userID, productData.images);
                }
            } else {
                console.error('Product document not found.');
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
            <>
                {productInfo?.images && (
                    images.map((image, index) => (
                        <div
                            key={index}
                            className="image-container"
                            onClick={() => openLightbox(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                            // Add width, height, srcSet, and sizes attributes if needed
                            />
                        </div>
                    ))
                )}
                <Lightbox
                    open={isOpen}
                    close={closeLightbox}
                    slides={images}
                    index={selectedImageIndex}
                />

            </>
        </div>
    );
};

ProdBox.propTypes = {
    productNameUserID: PropTypes.string.isRequired,
};

export default ProdBox;
