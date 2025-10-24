import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { UsersCollection } from "../db/models/user.js";
import { FIFTEEN_MINUTES, THIRTY_DAYS } from "../constants/index.js";
import { SessionCollection } from "../db/models/session.js";
import jwt from "jsonwebtoken";
import { SMTP } from "../constants/index.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { sendEmail } from "../utils/sendMail.js";
import { getFullNameFromGoogleTokenPayload, validateCode } from "../utils/googleOAuth2.js";

export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (user) {
        throw createHttpError(
           409, 'Email in use'
        );
    };

    const encryptedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });

    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(
            401, 'User not found'
        );
    }
    const isEqual = await bcrypt.compare(payload.password, user.password);
    if (!isEqual) {
        throw createHttpError(
            401, 'Unauthorized'
        );
    }

    await SessionCollection.deleteOne({ userId: user._id });
    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    return await SessionCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil:  new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
    });
};

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
    await SessionCollection.deleteOne({ _id: sessionId });
};


export async function sendResetPassword(email) {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw (createHttpError(404, "User not found"));
  }

  const resetToken = jwt.sign(
    {
      sub: user._id.toString(),
      email,
    },
    getEnvVar("JWT_SECRET"),
    { expiresIn: "5m" }
  );

  const frontendDomain = getEnvVar("APP_DOMAIN");
  const resetLink = `${frontendDomain}/reset-password?token=${resetToken}`;
  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: "Reset password request",
      html: `<h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link will expire in 5 minutes.</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw createHttpError(500, "Failed to send the email, please try again later");
  };
  return {
    status: 200,
    message: "Reset password email sent successfully",
    data: {},
  };
  };

  export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
    return {
      status: 200,
      message: "Password has been reset successfully",
      data: {},
    };
  };

  export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401);

  let user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  }

  const newSession = createSession();

  return await SessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};