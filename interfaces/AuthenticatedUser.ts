interface AuthUser {
  user: {
    name: string;
    email: string;
    department: {
      departmentName: string;
      departmentRole: string;
    };
    role: string;
    id: string;
  };
  accessToken: string;
  refreshToken: string;
}

export default AuthUser;
