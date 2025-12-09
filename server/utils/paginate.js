/**
 * Paginate a Mongoose model with flexible sort and populate
 * @param {Object} model - Mongoose model
 * @param {Object} query - Mongoose filter
 * @param {Object} options - { page, limit, populate, sort }
 *   - page: number (default 1)
 *   - limit: number (default 10)
 *   - sort: object or array of objects, e.g., { createdAt: -1 } or [{ createdAt: -1 }, { name: 1 }]
 *   - populate: string or array of objects/strings, e.g., 'doctor' or [{ path: 'doctor', select: 'name email' }]
 * @returns {Object} paginated result
 */
export const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  // Handle sort
  let sort = options.sort || { createdAt: -1 };
  if (Array.isArray(sort)) {
    // Merge array of sort objects into one object
    sort = Object.assign({}, ...sort);
  }

  // Count total documents
  const totalDocs = await model.countDocuments(query);

  // Build Mongoose query
  let mongooseQuery = model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Handle populate
  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach(pop => mongooseQuery = mongooseQuery.populate(pop));
    } else {
      mongooseQuery = mongooseQuery.populate(options.populate);
    }
  }

  // Execute query
  const results = await mongooseQuery.exec();

  return {
    results,
    page,
    limit,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit),
    hasNextPage: page * limit < totalDocs,
    hasPrevPage: page > 1
  };
};
