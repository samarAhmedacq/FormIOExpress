import userSchema from "../models/userSchema";
import { Request, Response } from "express";
import User, { loginUser } from "../interfaces/User";
import {
  findEmail,
  findByEmail,
  GiveTokens,
  updateRtHash,
  getUser,
  createUser,
} from "../Utils/userUtils";
import * as bcrypt from "bcryptjs";
import Tokens, { UserToken } from "../interfaces/Tokens";
import { userGet, userGetByDepartment } from "../queries/userQueries";

exports.createUser = async (req: any, res: Response) => {
  const User: User = req.body;
  const { usersContainer } = req.cosmos;

  const found = await findEmail(req, User.email);
  const { error } = await userSchema.validate(User);
  if (error) {
    res.status(404).json({ error: error.details[0].message });
    return;
  } else if (found) {
    res.status(404).json({ response: "Email already present" });
    return;
  }
  const passToHash = User.password ?? "";
  const Password: string = await bcrypt.hash(passToHash, 10);
  User.password = Password;
  User.hashedRt = null;
  await usersContainer.items
    .create(User)
    .then(({ resource }: any) => {
      res.status(201).json({ response: "user created successfully" });
    })
    .catch((error: any) => {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Internal server error" });
    });
};
exports.signIn = async (req: Request, res: Response) => {
  const User: loginUser = req.body;

  const singleUser: User = await findByEmail(req, User.email);
  if (!singleUser) {
    res.status(404).json({ response: "User Not Found" });
    return;
  }
  const password: string = singleUser.password ?? "";
  const passwordMatches: boolean | void = await bcrypt.compare(
    User.password,
    password
  );
  if (!passwordMatches) {
    res.status(404).json({ response: "Incorrect Password" });
    return;
  }

  const user: User = createUser(singleUser);

  const { accessToken, refreshToken }: Tokens = await GiveTokens(user);
  const id: string = singleUser.id ?? "";
  const { resource } = await updateRtHash(req, id, user.email, refreshToken);
  res
    .status(200)
    .json({ user: user, accessToken: accessToken, refreshToken: refreshToken });
  return;
};

exports.getAllUsers = async (req: any, res: Response) => {
  const { id } = req.user;
  const { usersContainer } = req.cosmos;
  const querySpec = userGet(id);

  const { resources } = await usersContainer.items.query(querySpec).fetchAll();

  if (resources.length > 0) {
    const users: User[] = resources;
    res.status(200).json({ users: users });
    return;
  } else {
    res.status(404).json({ error: "No User Found" });
    return;
  }
};

exports.getAllUsersOfDepartment = async (req: any, res: Response) => {
  const departmentName: string = req.params.departmentName;
  const { id } = req.user;
  const { usersContainer } = req.cosmos;
  const querySpec = userGetByDepartment(id, departmentName);

  const { resources } = await usersContainer.items.query(querySpec).fetchAll();

  if (resources.length > 0) {
    const users: User[] = resources;
    res.status(200).json({ users: users });
    return;
  } else {
    res.status(404).json({ error: "No User Found" });
    return;
  }
};

exports.RefreshTokens = async (req: any, res: Response) => {
  const { rt, id } = req.user;

  const user = await getUser(req, res, id);
  if (!user) {
    res.status(404).json({ response: "User Not Found" });
    return;
  }
  const userToken: UserToken = {
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    id: user.id,
  };
  const rtMatches: boolean | void = await bcrypt.compare(rt, user.hashedRt);
  if (!rtMatches) {
    res.status(404).json({ response: "user does not exists" });
    return;
  }
  const { accessToken, refreshToken } = await GiveTokens(userToken);
  res
    .status(200)
    .json({ accessToken: accessToken, refreshToken: refreshToken });
  return;
};

exports.deleteUser = async (req: any, res: Response) => {
  const UserToBeDeleted: string = req.params.userId;
  const { usersContainer } = req.cosmos;
  const singleUser: User = await getUser(req, res, UserToBeDeleted);
  if (!singleUser) {
    res.status(404).json({ response: "User Not Found" });
    return;
  }
  await usersContainer.item(singleUser.id, singleUser.email).delete();
  res.status(200).json({ response: `${singleUser.name} User Deleted` });
  return;
};
