import api from '../api/axiosConfig';

const OCRService = {
  /**
   * Extract CCCD information from image file
   * @param {File} imageFile - The CCCD image file to process
   * @returns {Promise} Response with extracted CCCD data
   */
  extractCCCD: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/ocr/extract-cccd', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default OCRService;
