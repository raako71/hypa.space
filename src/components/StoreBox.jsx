import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types';

const StoreBox = ({ userName, userID, storeName }) => {
    const domain = location.origin;
    const [imageUrl, setImageUrl] = useState("/placeHolder.jpg");

    const getStoreImage = async () => {
        // Fetch and set user account image
        const storage = getStorage();
        const userAccountDirectoryRef = ref(storage, `users/${userID}/account/accountImageS`);
        const storeImage = await getDownloadURL(userAccountDirectoryRef);
        setImageUrl(storeImage);
    }

    //cache images after loading
    useEffect(() => {
        if (imageUrl) {
          const img = new Image();
          img.src = imageUrl;
        }
      }, [imageUrl]);   

    useEffect(() => {
        getStoreImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="storeBox">
            {imageUrl && <img src={imageUrl} alt="Store Image" style={{ margin: "10px", width: "200px" }}/>}
            <h1><a href={domain + "/store/" + userName}>{storeName}</a></h1>
        </div>
    )
}

StoreBox.propTypes = {
    userName: PropTypes.string.isRequired,
    userID: PropTypes.string.isRequired,
    storeName: PropTypes.string.isRequired
};

export default StoreBox;