import axios from "axios";
import { useState, useEffect } from "react";

function useUserData() {
  const [userData, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log(userId, "userIduserIduserId----------------");

    if (!userId) {
      setError("User ID not found. Please login.");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("accessToken");
    axios
      .get(`http://localhost:4003/api/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setUser(res.data); // API returns user object
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  return { userData, loading, error };
}

export default useUserData;
