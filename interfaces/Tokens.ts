export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserToken {
  name: string;
  email: string;
  department: {
    departmentName: string;
    departmentRole: string;
  };
  role: string;
  id: string;
}
export default Tokens;
