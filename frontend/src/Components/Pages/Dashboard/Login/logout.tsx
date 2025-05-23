import { useEffect } from "react";
import { useAuth } from "./authcontext";

const Logout = () => {
  const { afterLogout } = useAuth();

  useEffect(() => {
    afterLogout();
  }, [afterLogout]);

  return <div>Logging out...</div>;
};

export default Logout;
