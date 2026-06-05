// ================= STOCK ITEMS =================

import API from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";

export const fetchStockItemDropdown = async () => {
  try {
    const response = await API.get(API_ENDPOINTS.GET_STOCK_ITEM_DROPDOWN);

    return response?.data?.data || [];
  } catch (error) {
    console.log("Error fetching stock items", error);
    return [];
  }
};

// ================= GODOWN =================

export const fetchGodownList = async () => {
  try {
    const response = await API.get(API_ENDPOINTS.godown_list);

    return response?.data?.data || [];
  } catch (error) {
    console.log("Error fetching godowns", error);
    return [];
  }
};

// ================= LEDGER =================

export const fetchLedgerDropdown = async () => {
  try {
    const response = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);

    return response?.data?.data || [];
  } catch (error) {
    console.log("Error fetching ledger", error);
    return [];
  }
};

// ================= AVAILABLE STOCK =================

export const fetchAvailableStock = async ({ itemId, godownId }) => {
  if (!itemId || !godownId) return 0;

  try {
    const response = await API.get(
      `${API_ENDPOINTS.GET_AVAILABLE_QTY_OF_STOCK}?item_id=${itemId}&godown_id=${godownId}`,
    );

    return response?.data?.data?.available_stock || 0;
  } catch (error) {
    console.log("Error fetching stock", error);
    return 0;
  }
};

// ================= BATCHES =================

export const fetchBatches = async (itemId, godownId) => {
  if (!itemId || !godownId) return [];

  try {
    const response = await API.get(
      `${API_ENDPOINTS.GET_BATCH_BY_STOCK_ITEM_ID}?item_id=${itemId}&godown_id=${godownId}`,
    );

    return response?.data?.data || [];
  } catch (error) {
    console.log("Batch fetch error", error);
    return [];
  }
};

// ================= PURCHASE LEDGER =================

export const fetchPurchaseLedgerDropdown = async () => {
  try {
    const response = await API.get(API_ENDPOINTS.GET_PURCHASE_LEDGER_DROPDOWN);

    return response?.data?.data || [];
  } catch (error) {
    console.log("Error fetching purchase ledger", error);

    return [];
  }
};

// ================= SUPPLIER DROPDOWN =================

export const fetchSupplierDropdown = async () => {
  try {
    const response = await API.get(API_ENDPOINTS.GET_SUPPLIER_DROPDOWN);

    return response?.data?.data || [];
  } catch (error) {
    console.log("Error fetching supplier dropdown", error);

    return [];
  }
};

export const fetchStockItemDetailsByID = async (itemId) => {
  if (!itemId) return null;
  try {
    const res = await API.get(`${API_ENDPOINTS.getStockItemById}/${itemId}`);
    if (res?.status === 200) {
      const d = res?.data?.data;
      return {
        unit_name: d?.base_unit_name || "",
        unit_id: d?.unit_id || "",
        rate: Number(d?.opening_stock?.rate || 0),
        available_qty: Number(d?.opening_stock?.quantity || 0),
        alt_unit_qty: d?.alternative_unit_value || "",
        alt_unit_name: d?.alternative_unit_name || "",
        supercash_price: Number(d?.opening_stock?.supercash_price || 0),
        gst_applicable: Number(d?.gst_applicable || 0),
        rate_of_duty: Number(d?.rate_of_duty || 0),
      };
    }
  } catch (err) {
    console.error("Stock item details fetch error", err);
  }
  return null;
};

// ================= NEXT VOUCHER NO =================

export const fetchNextVoucherNo = async (voucherType) => {
  if (!voucherType) return null;

  try {
    const response = await API.get(
      `${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=${voucherType}`,
    );

    return {
      voucher_no: response?.data?.voucher_no,
      voucher_type_id: response?.data?.voucher_type_id,
      nextSequence: response?.data?.nextSequence,
    };
  } catch (error) {
    console.log("Error fetching voucher no", error);

    return null;
  }
};

export const fetchLedgerDetailsByID = async (ledgerId) => {
  if (!ledgerId) return null;
  try {
    const res = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${ledgerId}`);
    if (res?.status === 200) {
      const d = res?.data?.data;
      return {
        current_balance: d?.current_balance || "0.00",
        balance_type: d?.balance_type || "Dr",
        security_amount: d?.interest_configs?.[0]?.security_amount || "0.00",
        credit_limit: d?.credit_limit || "0.00",
      };
    }
  } catch (err) {
    console.error("Ledger details fetch error", err);
  }
  return null;
};

// ================= CREATE PURCHASE =================

export const createPurchase = async (payload) => {
  try {
    const response = await API.post(API_ENDPOINTS.CREATE_PURCHASE, payload);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPendingBills = async (
  ledgerId
) => {

  if (!ledgerId) return [];

  try {

    const response = await API.get(
      `${API_ENDPOINTS.GET_PENDING_BILLS}/${ledgerId}`
    );

    return response?.data?.data || [];

  } catch (error) {

    console.log(error);

    return [];
  }
};

export const createReceipt = async (
  payload
) => {

  try {

    const response = await API.post(
      API_ENDPOINTS.CREATE_RECEIPT,
      payload
    );

    return response.data;

  } catch (error) {

    throw error;
  }
};