
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { registerSchema } from "../validators/authSchemas.js";

export async function register(req, res) {
  try {
    // Step 1: Check the data sent by the user.
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration information.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Step 2: Extract validated information.
    const { name, email, password, phone } = result.data;

    // Step 3: Check if the email is already registered.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Step 4: Hash the password before saving it.
    const passwordHash = await bcrypt.hash(password, 12);

    // Step 5: Create the account.
    // Public registration always creates a customer account.
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || undefined,
      role: "customer",
    });

    // Step 6: Return safe information only.
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    // Handle duplicate-email conflicts from MongoDB.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Log unexpected errors on the server.
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create your account right now.",
    });
  }
}
