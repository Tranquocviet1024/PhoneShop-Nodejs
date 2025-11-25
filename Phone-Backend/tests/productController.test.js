const productController = require('../src/controllers/productController');
const { ApiError } = require('../src/utils/apiResponse');
const { createMockReq, createMockRes, createMockNext } = require('./utils/mockExpress');

jest.mock('../src/models/Product', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock('../src/models/Category', () => ({
  findByPk: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/middleware/auditMiddleware', () => ({
  logAudit: jest.fn().mockResolvedValue(),
}));

const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const { logAudit } = require('../src/middleware/auditMiddleware');

describe('productController.createProduct', () => {
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createMockRes();
    next = createMockNext();
  });

  it('returns 400 when required fields are missing', async () => {
    const req = createMockReq({
      body: {
        name: '',
        category: 'phones',
        price: null,
      },
    });

    await productController.createProduct(req, res, next);

    expect(Product.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
  });

  it('creates product when category exists (numeric id)', async () => {
    const req = createMockReq({
      body: {
        name: 'iPhone 15',
        category: '1',
        price: 1000,
        originalPrice: 1200,
        image: 'img.jpg',
        description: 'flagship',
        stock: 10,
      },
      user: { id: 99 },
    });

    const categoryRecord = { id: 1, name: 'Phones' };
    const createdProduct = {
      id: 5,
      name: 'iPhone 15',
      category: 'Phones',
      toJSON: () => ({ id: 5, name: 'iPhone 15' }),
    };

    Category.findByPk.mockResolvedValue(categoryRecord);
    Product.create.mockResolvedValue(createdProduct);

    await productController.createProduct(req, res, next);

    expect(Category.findByPk).toHaveBeenCalledWith(req.body.category);
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'iPhone 15',
        category: 'Phones',
        price: 1000,
      })
    );
    expect(logAudit).toHaveBeenCalledWith(
      req,
      'CREATE',
      'Product',
      createdProduct.id,
      createdProduct.name,
      null,
      createdProduct.toJSON()
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: createdProduct,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when provided category does not exist', async () => {
    const req = createMockReq({
      body: {
        name: 'Pixel 9',
        category: 'NonExisting',
        price: 900,
        originalPrice: 950,
        image: 'img.jpg',
        description: 'desc',
      },
    });

    Category.findByPk.mockResolvedValue(null);
    Category.findOne.mockResolvedValue(null);

    await productController.createProduct(req, res, next);

    expect(Product.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toMatch(/Category/);
  });
});
