const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  res.statusCode = 200;
  return res;
};

const createMockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  userId: null,
  get(header) {
    return this.headers[header];
  },
  ...overrides,
});

const createMockNext = () => jest.fn();

module.exports = {
  createMockReq,
  createMockRes,
  createMockNext,
};
