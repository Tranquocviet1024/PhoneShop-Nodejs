import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const ProductGallery = ({ images = [], mainImage, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    // Combine main image with additional images
    const imageList = [];
    if (mainImage) {
      imageList.push({ imageUrl: getImageUrl(mainImage), isPrimary: true });
    }
    if (images && images.length > 0) {
      images.forEach(img => {
        const imgUrl = getImageUrl(img.imageUrl);
        if (imgUrl !== getImageUrl(mainImage)) {
          imageList.push({ ...img, imageUrl: imgUrl });
        }
      });
    }
    setAllImages(imageList);
  }, [images, mainImage]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  if (allImages.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <p className="text-gray-500">Không có hình ảnh</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 group">
        <img
          src={allImages[currentIndex]?.imageUrl}
          alt={`${productName} - ${currentIndex + 1}`}
          className="w-full h-96 object-contain cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        />

        {/* Zoom Icon */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition"
        >
          <ZoomIn size={20} />
        </button>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                index === currentIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={image.imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <X size={32} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <ChevronLeft size={48} />
          </button>

          <img
            src={allImages[currentIndex]?.imageUrl}
            alt={productName}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <ChevronRight size={48} />
          </button>

          {/* Thumbnails in Modal */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); handleThumbnailClick(index); }}
                className={`w-16 h-16 rounded overflow-hidden border-2 ${
                  index === currentIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Thumb ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
