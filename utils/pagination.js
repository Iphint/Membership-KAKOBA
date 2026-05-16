const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const toPositiveInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPaginationParams = (query = {}) => {
  const page = toPositiveInteger(query.page, DEFAULT_PAGE);
  const limit = Math.min(
    toPositiveInteger(query.limit, DEFAULT_LIMIT),
    MAX_LIMIT
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationMeta = ({ page, limit, totalItems }) => {
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  return {
    currentPage: page,
    perPage: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationMeta,
};
