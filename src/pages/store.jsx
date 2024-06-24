import PropTypes from 'prop-types';

const publicStore = ({ publicStore }) => {

};

publicStore.propTypes = {
    productNameUserID: PropTypes.string.isRequired,
    currentUserID: PropTypes.string.isRequired,
};

export default publicStore;