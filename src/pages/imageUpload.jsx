import React, { useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const ImageModification = ({ handleUpload }) => {
  const [previewImages, setPreviewImages] = useState([]);

  const onDrop = (acceptedFiles) => {
    const maxImages = 10;
    if (acceptedFiles.length + previewImages.length > maxImages) {
      alert("You can only upload up to 10 images.");
      return;
    }
    setPreviewImages([...previewImages, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "1px dashed black",
          padding: "20px",
          cursor: "pointer",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop some files here, or click to select files (up to 10 images)</p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {previewImages.map((file, index) => (
          <div key={index} style={{ margin: "10px", width: "300px", height: "300px", overflow: "hidden" }}>
            <AvatarEditor
              image={file}
              width={300}
              height={300}
              border={50}
              color={[255, 255, 255, 0.6]}
              scale={1}
              rotate={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

ImageModification.propTypes = {
  handleUpload: PropTypes.func.isRequired, // handleUpload prop is a function and is required
};

export default ImageModification;
