export const unwrapApiData = (response) => {
  const payload = response?.data ?? response;
  return payload?.data ?? payload;
};

export const normalizeCollection = (response) => {
  const data = unwrapApiData(response);

  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const candidates = [
    data.data,
    data.items,
    data.rows,
    data.results,
    data.records,
    data.docs,
    data.list,
    data.content,
    data.roles,
    data.users,
    data.userRoles,
    data.user_roles,
    data.permissions,
    data.rolePermission,
    data.role_permission,
    data.rolePermissions,
    data.role_permissions,
  ];

  const collection = candidates.find(Array.isArray);
  return collection || [];
};

export const normalizeResource = (response) => {
  const data = unwrapApiData(response);

  if (!data || Array.isArray(data) || typeof data !== "object") return data;

  return (
    data.data ??
    data.item ??
    data.detail ??
    data.result ??
    data.record ??
    data.row ??
    data.user ??
    data.role ??
    data.permission ??
    data
  );
};
