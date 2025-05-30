import axios from "axios";
import { useState, useEffect } from "react";

function useUserData() {
  const [userData, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    if (!userId || !token) {
      setError("User ID or token not found. Please login.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:4003/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser({ ...res.data, token }); // Include token in userData
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  return { userData, loading, error };
}

export default useUserData;
