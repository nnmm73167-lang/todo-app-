const { z} = require("zod");

const ragisterSchema = z.object({
  name: z
    .string({ required_error: "Name is Required" })
    .min(3, "name Must be at least 3 charecters")
    .trim(),
  password: z
    .string({ required_error: "password is Required" })
    .min(3, "password Must be at least 3 charecters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid Email Format")
    .toLowerCase()
    .trim(),
});
const loginSchema = ragisterSchema.pick({ email: true, password: true });
const forgotPasswordSchema = ragisterSchema.pick({ email: true });
const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: "password is Required" })
    .min(3, "password Must be at least 3 charecters"),
  newPassword: z
    .string({ required_error: "password is Required" })
    .min(3, "password Must be at least 3 charecters"),
});
const verifiEmailSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid Email Format")
    .toLowerCase()
    .trim(),
  otp: z
    .string({ required_error: "Plese Enter Otp" })
    .length(6, "Otp must be 6 charcters")
    .trim(),
});
const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid Email Format")
    .toLowerCase()
    .trim(),
  otp: z
    .string({ required_error: "Plese Enter Otp" })
    .length(6, "Otp must be 6 charcters")
    .trim(),
  newPassword: z
    .string({ required_error: "password is Required" })
    .min(3, "password Must be at least 3 charecters"),
});

module.exports = {
  ragisterSchema,
  resetPasswordSchema,
  verifiEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
};
