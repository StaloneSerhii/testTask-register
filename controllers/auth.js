const { User } = require("../models/users");
const { ctrlWrapper, HttpError, sendEmail } = require("../helpers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;
const { nanoid } = require("nanoid");

const register = async (req, res) => {
  const { email, password } = req.body;
  /* Пошук існуючиш пошт */
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already in use");
  }
  // Хешування паролю
  const result = await bcrypt.hash(password, 10);
  // Генеруваня токена веретифікації для відправки на пошту
  const verificationToken = nanoid();
  const newUser = await User.create({
    ...req.body,
    password: result,
    verificationToken,
  });
  // Відправка посиланя на емейл
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a taret="_blank" href="http://localhost:3011/api/auth/verify/${verificationToken}">Click Here</a>`,
  };
  await sendEmail(verifyEmail);
  // Поверненя даних на фронт (пошта)
  res
    .status(201)
    .json({ email: newUser.email, subscription: newUser.subscription });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // Пошук юзера по пошті
  const user = await User.findOne({ email });
  // Перевірка на правильність ведений даних ---логін
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  if (!user.verify) {
    throw HttpError(401, "Not Email verify");
  }
  // і паролю
  const compareRusult = await bcrypt.compare(password, user.password);
  if (!compareRusult) {
    throw HttpError(401, "Email or password invalid");
  }
  // поверненя ід користувача для хешуваня токену
  const payload = {
    id: user._id,
  };
  const { subscription } = user;
  // хешуваня токену
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  // Добавленя токену в бд користувачу
  await User.findByIdAndUpdate(user._id, { token });
  res.json({ token, user: { email, subscription } });
};

const logout = async (req, res) => {
  // Пошук і видаленя токену користувача
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({ message: "Logout success" });
};

const verificationToken = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  res.status(200).json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw HttpError(404, "missing required field email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a taret="_blank" href="http://localhost:3011/api/users/verify/${user.verificationToken}">Click Here</a>`,
  };
  await sendEmail(verifyEmail);
  res.status(200).json({
    message: "Verification email sent",
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  verificationToken: ctrlWrapper(verificationToken),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
