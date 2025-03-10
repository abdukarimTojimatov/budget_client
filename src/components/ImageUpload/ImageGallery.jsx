import React, { useState } from "react";
import { baseURL } from "../../utils/apiConfig";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const ImageGallery = ({ images = [], orderId, onImageDeleted }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 italic">
        Hech qanday rasm yuklanmagan
      </div>
    );
  }

  const openFullscreen = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  const handleDeleteImage = async (imageUrl, orderId, e) => {
    // Prevent default behavior which might cause navigation
    if (e) e.preventDefault();
    if (!orderId) return;

    try {
      // Extract filename from the image URL
      const filename = imageUrl.split("/").pop();

      // Send DELETE request to the API
      const response = await axios.delete(
        `${baseURL}/api/delete-order-image/${orderId}/${encodeURIComponent(
          filename
        )}`
      );

      if (response.status === 200) {
        toast.success("Rasm muvaffaqiyatli o'chirildi");

        // Notify parent component about the image deletion
        if (onImageDeleted) {
          // Pass the event to prevent navigation
          onImageDeleted(imageUrl, e);
        }
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(
        `Xatolik yuz berdi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-white font-bold text-lg mb-3">Rasmlar</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            {/* Image for viewing/opening */}
            <div
              className="cursor-pointer"
              onClick={() => openFullscreen(imageUrl)}
            >
              <img
                src={`${baseURL}${imageUrl}`}
                alt={`Order image ${index + 1}`}
                className="h-32 w-full object-cover rounded-lg"
              />
            </div>

            {/* Delete button */}
            {orderId && (
              <div
                className="absolute top-2 right-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleDeleteImage(imageUrl, orderId, e)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Delete image"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => openFullscreen(imageUrl)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100  text-xs transition-opacity duration-300 z-10"
              >
                Kattalashtirish
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <div className="relative max-w-4xl max-h-screen">
            <button
              className="absolute top-4 right-4 text-white text-2xl bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={closeFullscreen}
            >
              &times;
            </button>
            <img
              src={`${baseURL}${selectedImage}`}
              alt="Fullscreen view"
              className="max-h-screen max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
