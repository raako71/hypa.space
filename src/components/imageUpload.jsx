import React, { useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const ImageModification = ({ handleProcessedImagesUpload }) => {
  const [previewImages, setPreviewImages] = useState([]);
  
  const onDrop = (acceptedFiles) => {
    const maxImages = 10;
    if (acceptedFiles.length + previewImages.length > maxImages) {
      alert("You can only upload up to 10 images.");
      return;
    }
    setPreviewImages([...previewImages, ...acceptedFiles]);
  };

  const processImage = async (index) => {
    const editor = editorsRef.current[index];
    if (editor) {
      const canvasScaledSmall = editor.getImageScaledToCanvas();
      const canvasUnscaled = editor.getImage();
      const canvasUnscaledMax1000 = await scaleImage(canvasUnscaled, 1000);
  
      handleProcessedImagesUpload({
        scaled: canvasScaledSmall,
        unscaled: canvasUnscaledMax1000
      });
  
      // Remove the processed image from previewImages
      setPreviewImages(previewImages.filter((_, i) => i !== index));
    }
  };
  
  const scaleImage = (imageData, maxWidth) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let canvasWidth, canvasHeight;
  
        if (img.width > maxWidth) {
          canvasWidth = maxWidth;
          canvasHeight = canvasWidth / aspectRatio;
        } else {
          canvasWidth = img.width;
          canvasHeight = img.height;
        }
  
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
  
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.src = imageData.toDataURL();
    });
  };
  
  
  

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    acceptFunction: (file) => {
      console.log('Received file:', file);
    },
  });
  
  
  const editorsRef = React.useRef([]);

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "1px dashed black",
          padding: "20px",
          cursor: "pointer",
          margin: "8px 0",
          maxWidth: "350px"
        }}
      >
        <input {...getInputProps()} />
        <p style={{ textAlign: 'center' }}>Image Uploader<br/>Click to select, or drag &apos;n&apos; drop here.</p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          textAlign:"center"
        }}
      >
        {previewImages.map((file, index) => (
          <div key={index} style={{ margin: "10px" }}>
            <AvatarEditor
              ref={(editor) => (editorsRef.current[index] = editor)}
              image={file}
              width={350}
              height={350}
              border={50}
              color={[255, 255, 255, 0.6]}
              scale={1}
              rotate={0}
            />
            <div>
              <button
                style={{
                  bottom: "10px",
                  left: "50%",
                  backgroundColor: "red",
                  borderColor:"grey",
                  color:"white"
                }}
                onClick={() => processImage(index)}
              >
                Process Image
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ImageModification.propTypes = {
  handleProcessedImagesUpload: PropTypes.func.isRequired,
};

export default ImageModification;
