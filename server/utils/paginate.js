export const paginate = (query, { page = 1, limit = 10 }) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 10);
  const skip = (p - 1) * l;
  return { query: query.skip(skip).limit(l), page: p, limit: l, skip };
};
