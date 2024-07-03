import { useState } from 'react';
import DeleteProducts from '../components/deleteProduct';
import PropTypes from 'prop-types';

const DeletePage = ({
    userID,
    existingData
}) => {
    const [productNamesInput, setProductNamesInput] = useState('');
    const [productNamesToDelete, setProductNamesToDelete] = useState([]);
    const [runDelete, setRunDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [buttonText, setButtonText] = useState('Delete Products');

    const handleInputChange = (event) => {
        setProductNamesInput(event.target.value);
    };

    const handleDeleteButtonClick = async () => {
        const productNamesArray = productNamesInput.split(',').map(name => name.trim()).filter(name => name);

        if (productNamesArray.length === 0) return;

        setProductNamesToDelete(productNamesArray);
        setIsDeleting(true);
        setButtonText('Deleting...');
        setRunDelete(true);

        // Simulate a 1-second delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRunDelete(false);
        setIsDeleting(false);
        setButtonText('Delete Products');
    };

    return (
        <div className='article'>
            <h2>Delete Products</h2>
            <textarea
                value={productNamesInput}
                onChange={handleInputChange}
                placeholder="Enter product names to delete, separated by commas"
                rows="4"
                cols="50"
            />
            <br/>
            <button 
                onClick={handleDeleteButtonClick}
                disabled={isDeleting}
                style={{ backgroundColor: isDeleting ? 'grey' : '' }}
            >
                {buttonText}
            </button>
            {runDelete && (
                <DeleteProducts
                    userID={userID} // Example userID, replace with actual user ID
                    existingData={existingData} // Example existingData, adjust as per your structure
                    productNames={productNamesToDelete} // Pass the product names to delete
                    test={false} // Set test mode to false
                    run={runDelete} // Pass the run state
                    onComplete={() => {}} // No need to handle completion in this case
                />
            )}
        </div>
    );
};

DeletePage.propTypes = {
    userID: PropTypes.string,
    existingData: PropTypes.object
};

export default DeletePage;
