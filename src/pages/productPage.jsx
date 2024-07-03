import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import "yet-another-react-lightbox/styles.css";


const ProductPage = ({ userID, domain }) => {
    const [productInfo, setProductInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([{ key: 'S0', src: '/placeHolder.jpg', alt: 'Default Img' }]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [productUserID, setProductUserID] = useState('');
    const [productNameUserID, setProductNameUserID] = useState(null);
    const location = useLocation();

    const getDataFromURL = (data) => {
        const params = new URLSearchParams(location.search);
        const productName = params.get(data);
        console.log(productName);
        return productName;
    };

    useEffect(() => {
        setProductNameUserID(getDataFromURL('productName'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (productNameUserID != null) {
            const [, userID] = productNameUserID.split('_');
            setProductUserID(userID);
            getProductInfo(productNameUserID);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productNameUserID]);

    const openLightbox = () => {
        setIsOpen(true);
    };

    const updateIndex = ({ index: current }) =>
        setSelectedImageIndex(current);

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const indexImages = async (userID, hasImages) => {
        const basePath = `users/${userID}/${productNameUserID}`;

        let imageUrls = [];

        if (hasImages) {
            const storage = getStorage();
            let totalImages = 0;
            const directoryRef = ref(storage, basePath);
            try {
                const listResult = await listAll(directoryRef);
                listResult.items.forEach((itemRef) => {
                    const fileName = itemRef.name;
                    if (fileName.startsWith('S')) {
                        const numberPart = parseInt(fileName.substring(1)); // Extract number after 'S'
                        const addOne = numberPart + 1;
                        if (!isNaN(numberPart) && addOne > totalImages) {
                            totalImages = addOne; // Increment to the next number
                        }
                    }
                });
            } catch (error) {
                console.error("Error listing files:", error);
            }
            for (let i = 0; i < totalImages; i++) {
                const imagePathS = `${basePath}/S${i}`;
                try {
                    const urlS = await getDownloadURL(ref(storage, imagePathS));
                    const imgKey = `S${i}`;
                    imageUrls.push({ key: imgKey, src: urlS, alt: `Small Image ${i}`, width: "350", height: "350" });
                    setImages([...imageUrls]);
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
                window.location.assign(location.origin);
            }
        } catch (error) {
            console.error('Error fetching product info:', error);
            setTimeout(() => handleReload(), 3000);
        }
    };

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
                    <p style={{ whiteSpace: 'pre-wrap' }}>Description: {productInfo.productDescription}</p>
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
                    {productUserID == userID &&
                        <div>
                            <a href={domain + "/newProduct?productName=" + productNameUserID}>edit</a>
                        </div>
                    }
                </div>
            )}
            <>
                {productInfo?.images ? (
                    <Lightbox
                        index={selectedImageIndex}
                        slides={images}
                        plugins={[Inline]}
                        on={{
                            view: updateIndex,
                            click: () => openLightbox(),
                        }}
                        carousel={{
                            padding: 0,
                            spacing: 0,
                            imageFit: "cover",
                        }}
                        inline={{
                            style: {
                                width: "100%",
                                maxWidth: "350px",
                                aspectRatio: "1 / 1",
                                cursor: 'pointer'
                            },
                        }}
                        {...(images.length === 1 && {
                            render: {
                                buttonPrev: () => null,
                                buttonNext: () => null
                            }
                        })}
                    />
                ) : (
                    <div className="image-container">
                        <img
                            src={images[0].src}
                            alt={images[0].alt}
                            style={{ width: '350px' }}
                        />
                    </div>
                )}
                <Lightbox
                    open={isOpen}
                    close={closeLightbox}
                    slides={images}
                    index={selectedImageIndex}
                    {...(images.length === 1 && {
                        render: {
                            buttonPrev: () => null,
                            buttonNext: () => null
                        }
                    })}
                />

            </>
        </div>
    );
};

ProductPage.propTypes = {
    domain: PropTypes.string.isRequired,
    userID: PropTypes.string.isRequired,
};

export default ProductPage;
