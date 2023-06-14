import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import Tokens from "../interfaces/Tokens";
import { Response } from "express";
const nodemailer = require("nodemailer");
export const findEmail = async (req: any, email: string) => {
  const { usersContainer } = req.cosmos;

  const querySpec = {
    query: "SELECT c.email FROM c",
  };
  const { resources } = await usersContainer.items.query(querySpec).fetchAll();
  return resources.some((item: any) => item.email === email);
};

export const findByEmail = async (req: any, email: string) => {
  const { usersContainer } = req.cosmos;
  const querySpec = {
    query: "SELECT * FROM users u WHERE u.email = @email",
    parameters: [{ name: "@email", value: email }],
  };

  const { resources: users } = await usersContainer.items
    .query(querySpec)
    .fetchAll();

  return users[0];
};

export const GiveTokens = async (user: any): Promise<Tokens> => {
  const accessToken: string = await jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "5h",
    }
  );

  const refreshToken: string = await jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

export const updateRtHash = async (
  req: any,
  id: string,
  email: string,
  rt: string
) => {
  const { usersContainer } = req.cosmos;
  const user = await usersContainer.item(id, email).read();
  if (!user || !user.resource) {
    throw new Error(`User with ID ${id} not found`);
  }
  const hash = await hashData(rt);
  user.resource.hashedRt = hash;
  const { resource } = await usersContainer
    .item(id, email)
    .replace(user.resource);
  return resource;
};

const hashData = async (data: string) => {
  return bcrypt.hash(data, 10);
};

export const getUser = async (req: any, res: Response, userId: string) => {
  const { usersContainer } = req.cosmos;
  const querySpec = {
    query: "SELECT * FROM c WHERE c.id = @id",
    parameters: [
      {
        name: "@id",
        value: userId,
      },
    ],
  };

  const { resources } = await usersContainer.items.query(querySpec).fetchAll();

  if (resources.length > 0) {
    const user = resources[0];
    return user;
  } else {
    res.status(404).json({ error: "No user Found with this ID" });
    return;
  }
};

export const sendEmail = async (
  recipientEmail: string,
  senderEmail: string,
  Content: string
) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // StartTLS should be enabled
    auth: {
      user: "developer@aquila360.com",
      pass: "36O@qu!la",
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let mailOptions = {
    from: "developer@aquila360.com",
    to: "samarahmedfast5@gmail.com",
    subject: "Hello",
    text: Content,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
