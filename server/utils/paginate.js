export const paginate = async (model, query = {}, page = 1, limit = 10, populate = "") => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.find(query).populate(populate).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);
  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};
