export const userGet = (id: string) => {
  return {
    query:
      "SELECT c.id,c.email,c.name,c.role,c.department FROM c WHERE c.id != @id",
    parameters: [
      {
        name: "@id",
        value: id,
      },
    ],
  };
};

export const userGetByDepartment = (id: string, departmentName: string) => {
  return {
    query:
      "SELECT c.id, c.email, c.name, c.role, c.department FROM c WHERE c.id != @id AND c.department.departmentName = @departmentName",
    parameters: [
      {
        name: "@id",
        value: id,
      },
      {
        name: "@departmentName",
        value: departmentName,
      },
    ],
  };
};
