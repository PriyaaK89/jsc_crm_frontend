import { useEffect, useState } from "react";
import API from "../services/api";
import { API_ENDPOINTS } from "../../src/services/endpoints";

const GetPartyName = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchParty = async () => {
    try {
      setLoading(true);
      const res = await API.get(API_ENDPOINTS.get_part_list);

      if (res.status === 200) {
        setUsers(res.data.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParty();
  }, []);

  return { users, loading, fetchParty };
};



export default GetPartyName
