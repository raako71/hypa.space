import { useEffect, useState } from 'react';
import StoreBox from '../components/StoreBox';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Home = () => {
    const [userID, setUserID] = useState('cPPrTRqhv9Rjnle7rqF3wc3gpSb2');
    const [userName, setUserName] = useState('harry');
    const [storeName, setStoreName] = useState("Cool man And then I?");
    const [stores, setStores] = useState(null);

    const listStores = async () => {
        try {
            const firestore = getFirestore();
            const usersDocRef = doc(firestore, 'users', 'allusers');
            const usersDocSnapshot = await getDoc(usersDocRef);
            if (usersDocSnapshot.exists()) {
                const productData = usersDocSnapshot.data();
                const result = {};
                for (const [userName, userID] of Object.entries(productData)) {
                    if (userID !== "reserved") {
                      result[userName] = [userID, ''];
                    }
                  }
            } else {
                console.error("failed to retrieve store names")
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

    return (
        <>
            <div className="article">
                <h1>Store Index</h1>
            </div>
            <StoreBox 
          userName={userName} 
          userID={userID} 
          storeName={storeName} 
          />
        </>
    )
}

export default Home