import { useEffect, useState } from "react";
import API from "../services/api";
import { API_ENDPOINTS } from "../../src/services/endpoints";

const useUsersapi = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get(API_ENDPOINTS.get_user_list);

      if (res.status === 200) {
        setUsers(res?.data?.data || []);
       console.log(res?.data?.data, "UserList")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, fetchUsers };
};

export default useUsersapi
