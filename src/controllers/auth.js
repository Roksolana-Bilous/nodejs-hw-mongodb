import { registerUser, loginUser } from "../services/auth.js";
import { THIRTY_DAYS } from "../constants/index.js";
import { logoutUser } from "../services/auth.js";
import { refreshUsersSession } from "../services/auth.js";
import { sendResetPassword } from "../services/auth.js";
import { resetPassword } from "../services/auth.js";

const setupSession = (res, session) => {
    res.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
};

export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: user,
    });
};

export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body);
    setupSession(res, session);

    res.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });

    res.status(200).json({
  status: 200,
  message: "Successfully logged in an user!",
  data: { accessToken: session.accessToken },
});
};

export const logoutUserController = async (req, res) => {
    if (req.cookies.sessionId) {
        await logoutUser(req.cookies.sessionId);
    }
    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");

    res.status(204).send();
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const sendResetPasswordController = async (req, res) => {
  const { email } = req.body;
  const result = await sendResetPassword(email);
    res.json({
        status: 200,
      message: result.message,
    });
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};