// utils/api.js
export const fetchBoardDetails = async (boardId) => {
    try {
      const response = await fetch(`/api/work?boardId=${boardId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      console.error('Error fetching board details:', error);
      throw error;
    }
  };
  