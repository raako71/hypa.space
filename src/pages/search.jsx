// Search.js
import { useState, useEffect } from 'react';
//import { OpenStreetMapProvider } from ' ';
import { LocationIQProvider } from 'leaflet-geosearch';
import _debounce from 'lodash/debounce';

const Search = ({ onSelectResult }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [ignoreSearch, setIgnoreSearch] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
    const handleSearch = () => {
    if(ignoreSearch){
      setIgnoreSearch(false);
      return;
    }
    const provider = new LocationIQProvider({
      params: {
        key: 'pk.e229813b209ed9d50b78ea5901a3e128',
      },
    });
    provider.search({ query: searchQuery }).then((results) => {
      setSearchResults(results);
    }).catch(error => {
      console.error('Error fetching search results', error);
    });
  };

  useEffect(() => {
    if (searchResults.length > 0) {
      //setSelectedResult(searchResults[0]);
      setShowDropdown(true);
    }
  }, [searchResults]);

  useEffect(() => {
    debouncedSearch();
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    setIgnoreSearch(true);
    setSearchQuery(result.label);
    setShowDropdown(false); // Close the dropdown after selecting a result
    setSearchResults([]);
    onSelectResult(result); // Trigger the callback with the selected result
  };

  const debouncedSearch = _debounce(handleSearch, 300); // Adjust the debounce delay as needed

  return (
    <div style={{ position: 'relative', margin: 'auto', width: '500px' }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter location"
      />

      {showDropdown && searchResults.length > 0 && (
        <ul
          style={{
            listStyleType: 'none',
            padding: '0',
            margin: '5px 0 0',
            border: '1px solid #ccc',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            backgroundColor: '#fff',
            position: 'absolute',
            zIndex: '1',
          }}
        >
          {searchResults.map((result, index) => (
            <li
              key={index}
              onClick={() => handleSelectResult(result)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #ccc',
              }}
            >
              {result.label}
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Search;
