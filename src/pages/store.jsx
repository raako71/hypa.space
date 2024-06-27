import { useEffect, useState } from 'react';
import Products from './products';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const PublicStore = () => {
    const { userName } = useParams();
    const [storeInfo, setStoreInfo] = useState(null);
    const navigate = useNavigate();
    const [storeImage, setStoreImage] = useState('');
    const [telegramEnabled, enableTelegram] = useState(false);
    const [wspEnabled, enableWSP] = useState(false);
    const [storeAddress, setStoreAddress] = useState(false);
    const [userID, setUserID] = useState(null);

    const getStoreInfo = async () => {
        try {
            const firestore = getFirestore();
            const usersDocRef = doc(firestore, 'users', 'allusers');
            const usersDocSnapshot = await getDoc(usersDocRef);
            let userID;
            if (usersDocSnapshot.exists()) {
                const productData = usersDocSnapshot.data();
                userID = productData[userName];
                setUserID(userID);
                getStoreImage(userID);
            } else {
                console.error("failed to retrieve store name")
                return;
            }
            try {
                const userDocRef = doc(firestore, 'users', userID);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setStoreInfo(userData);
                    if (!userData.sellerEnabled) {
                        throw new Error('Seller is not enabled for this user');
                    }
                    if (userData.telegram) enableTelegram(true);
                    if (userData.whatsApp) enableWSP(true);
                    if (userData.address != "") setStoreAddress(userData.address);
                }
            } catch (error) {
                console.error('No Bueno');
                navigate('/');
            }
        } catch (error) {
            console.error('Error fetching product info:', error);
        }
    };

    const getStoreImage = async (userID) => {
        // Fetch and set user account image
        const storage = getStorage();
        const userAccountDirectoryRef = ref(storage, `users/${userID}/account/accountImageS`);
        const downloadURL = await getDownloadURL(userAccountDirectoryRef);
        setStoreImage({
            scaled: downloadURL,
            unscaled: ''
        });
    }

    useEffect(() => {
        getStoreInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <div className='storeHeader'>
                {storeImage.scaled && (
                    <img
                        src={storeImage.scaled}
                        alt="Store Image"
                        style={{ margin: "10px", width: "200px" }}
                    />
                )}
                {storeInfo && (
                    <div><h1>{storeInfo.storeName}</h1>
                        {storeAddress && (
                            <p>Store Address: {storeAddress}</p>
                        )}
                        <p>Phone number: <a target='_blank' rel="noreferrer" href={`tel:${storeInfo.phoneNumber}`}>{storeInfo.phoneNumber}</a></p>
                        {wspEnabled && (<p><a target='_blank' rel="noreferrer" href={`https://wa.me/${storeInfo.phoneNumber}`}>WhatsApp</a></p>)}
                        {telegramEnabled && (<p><a target='_blank' rel="noreferrer" href={`https://t.me/${storeInfo.phoneNumber}`}>Telegram</a></p>)}
                    </div>
                )}
            </div>
            <Products
                existingData={storeInfo}
                userID={userID}
            />
        </div>
    )

};

export default PublicStore;