const config = require('./../config');

const { pagination } = config;

const paginationParseParams = ({
  limit = pagination.limit,
  page = pagination.page,
  offset = pagination.offset,
}) => ({
  limit: parseInt(limit, 10),
  page: parseInt(page, 10),
  offset: offset ? parseInt(offset, 10) : (page - 1) * limit,
});

module.exports = {
  paginationParseParams,
};
