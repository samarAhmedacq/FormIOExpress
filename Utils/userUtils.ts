import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import Tokens from "../interfaces/Tokens";
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
  const {resource}=await usersContainer.item(id, email).replace(user.resource);
  return resource;
};

const hashData = async (data: string) => {
  return bcrypt.hash(data, 10);
};
