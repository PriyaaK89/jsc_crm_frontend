export const sectionStyle = { bg: "white", border: "1px solid #d0d7de", borderRadius: "6px", p: 0, mb: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
export const sectionHeaderStyle = { bg: "#4f9190", color: "white", px: 4, py: 2, borderTopRadius: "md" };
export const labelStyle = { fontSize: "12px", color: "#494949", marginBottom: "3px" };
export const inputStyle = { size: "sm", borderRadius: "6px", borderColor: "#c8d0d8", bg: "white", fontSize: "12px", height: "40px", _focus: { borderColor: "#3d7a52", boxShadow: "0 0 0 1px #3d7a52" } };
export const thStyle = { borderColor: "#c8d8cc", p: "6px 4px", fontWeight: "700", letterSpacing: "0.3px", whiteSpace: "nowrap", fontSize: "11px" };
export const tdStyle = { p: "2px 3px", borderColor: "#e0e8e2", verticalAlign: "middle" };
export const errMsg = (e, fallback) => e?.response?.data?.message || fallback;