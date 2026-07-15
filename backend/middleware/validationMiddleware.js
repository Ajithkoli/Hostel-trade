import { body, param, query, validationResult } from "express-validator";

// Middleware to format validation errors and return standard JSON response
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(". ");
    return res.status(400).json({
      success: false,
      status: "fail",
      message: errorMessages,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("hostel")
    .trim()
    .notEmpty().withMessage("Hostel hall is required"),
  handleValidationErrors
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  handleValidationErrors
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  handleValidationErrors
];

export const resetPasswordValidator = [
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  handleValidationErrors
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  handleValidationErrors
];

export const profileUpdateValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("hostel")
    .optional()
    .trim()
    .notEmpty().withMessage("Hostel hall cannot be empty"),
  handleValidationErrors
];

export const productValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ max: 100 }).withMessage("Product name cannot exceed 100 characters"),
  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),
  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters"),
  body("price")
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("stock")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("intent")
    .isIn(["Buy", "Rent"]).withMessage("Intent must be either 'Buy' or 'Rent'"),
  handleValidationErrors
];

export const lostFoundValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters"),
  body("type")
    .isIn(["Lost", "Found"]).withMessage("Type must be either 'Lost' or 'Found'"),
  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),
  body("location")
    .trim()
    .notEmpty().withMessage("Location is required"),
  body("hostel")
    .trim()
    .notEmpty().withMessage("Hostel is required"),
  body("dateLostOrFound")
    .isISO8601().withMessage("Please enter a valid date"),
  body("contactPreference")
    .isIn(["Chat", "Email", "Phone"]).withMessage("Contact preference must be Chat, Email, or Phone"),
  body("reward")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage("Reward must be a positive number"),
  handleValidationErrors
];

export const chatMessageValidator = [
  body("receiver")
    .isMongoId().withMessage("Invalid receiver user ID"),
  body("message")
    .trim()
    .notEmpty().withMessage("Message content cannot be empty")
    .isLength({ max: 2000 }).withMessage("Message cannot exceed 2000 characters"),
  handleValidationErrors
];

export const paramIdValidator = [
  param("id").isMongoId().withMessage("Invalid resource identifier format"),
  handleValidationErrors
];
