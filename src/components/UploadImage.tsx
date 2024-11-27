import { useState, useRef } from 'react';

const UploadImage = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to handle capturing image from the camera
  const handleCaptureImage = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/png');
          setImageSrc(imageData);

          stream.getTracks().forEach(track => track.stop());
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // Function to handle uploading an image from the file system
  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Capture or Upload Image</h2>
      <div style={{ marginBottom: '20px' }}>
        {/* Button to capture image from the camera */}
        <button className="primary button" onClick={handleCaptureImage}>
          CAPTURE IMAGE
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {/* Button to upload image from the file system */}
        <button className="primary button" onClick={() => fileInputRef?.current?.click()}>
          UPLOAD IMAGE
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUploadImage}
        />
      </div>

      {/* Display the captured or uploaded image */}
      {imageSrc && (
        <div>
          <h3>Preview:</h3>
          <img src={imageSrc} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default UploadImage;
