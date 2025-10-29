import Joi from 'joi';

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('USER', 'ADMIN').default('USER')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Product validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Product name must be at least 2 characters long',
    'string.max': 'Product name cannot exceed 100 characters',
    'any.required': 'Product name is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  description: Joi.string().max(500).required().messages({
    'string.max': 'Description cannot exceed 500 characters',
    'any.required': 'Description is required'
  }),
  stock: Joi.number().min(0).default(0).messages({
    'number.min': 'Stock cannot be negative'
  })
});

const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    'string.min': 'Product name must be at least 2 characters long',
    'string.max': 'Product name cannot exceed 100 characters'
  }),
  price: Joi.number().min(0).messages({
    'number.min': 'Price cannot be negative'
  }),
  description: Joi.string().max(500).messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  stock: Joi.number().min(0).messages({
    'number.min': 'Stock cannot be negative'
  })
});

// Cart validation schemas
const cartItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Product ID must be a valid MongoDB ObjectId',
    'string.length': 'Product ID must be 24 characters long',
    'any.required': 'Product ID is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  })
});

// Order validation schemas
const orderStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('Payment_pending', 'Paid', 'Shipped', 'Deliverd', 'Cancelled').required().messages({
    'any.only': 'Status must be one of: Payment_pending, Paid, Shipped, Deliverd, Cancelled',
    'any.required': 'Status is required'
  })
});

// Query validation schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('name', 'price', 'createdAt', '-name', '-price', '-createdAt').default('-createdAt'),
  search: Joi.string().max(100).allow('')
});

const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('Payment_pending', 'Paid', 'Shipped', 'Deliverd', 'Cancelled'),
  sort: Joi.string().valid('createdAt', 'totalAmount', 'status', '-createdAt', '-totalAmount', '-status').default('-createdAt')
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({success: false, message: 'Validation error', errors: error.details.map(detail => detail.message)});
    }
    next();
  };
};

// Query validation middleware factory
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({success: false, message: 'Query validation error', errors: error.details.map(detail => detail.message)
      });
    }
    req.query = value;
    next();
  };
};

export {
  registerSchema,
  loginSchema,
  productSchema,
  productUpdateSchema,
  cartItemSchema,
  orderStatusUpdateSchema,
  paginationSchema,
  orderQuerySchema,
  validate,
  validateQuery
};

