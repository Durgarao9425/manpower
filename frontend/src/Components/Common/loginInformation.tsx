import axios from "axios";
import { useState, useEffect } from "react";

function useUserData() {
  const [userData, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log(userId,"userIduserIduserId----------------")

    if (!userId) {
      setError("User ID not found. Please login.");
      setLoading(false);
      return;
    }
    fetch(`http://localhost:4003/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        setUser(data); // API returns user object
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { userData, loading, error };
}

export default useUserData;
