const { CosmosClient } = require("@azure/cosmos");

const cosmosDB = (req: any, res: any, next: any) => {
  const endpoint = process.env.ENDPOINT;
  const key = process.env.KEY;
  const databaseId = process.env.DATABASE_ID;
  const UsersContainerId = process.env.USERS_CONTAINER_ID;
  const FormsContainerId = process.env.FORMS_CONTAINER_ID;
  const SubmissionsContainerId = process.env.SUBMISSIONS_CONTAINER_ID;
  const SubmissionsRequestsContainerId = process.env.SUBMISSIONS_REQUESTS_CONTAINER_ID;
  const RequestsContainerId = process.env.REQUESTS_CONTAINER_ID;
  const client = new CosmosClient({ endpoint, key });
  const database = client.database(databaseId);
  const usersContainer = database.container(UsersContainerId);
  const formsContainer = database.container(FormsContainerId);
  const submissionsContainer = database.container(SubmissionsContainerId);
  const submissionRequestsContainer=database.container(SubmissionsRequestsContainerId);
  const requestsContainer = database.container(RequestsContainerId);

  req.cosmos = {
    client,
    database,
    usersContainer,
    formsContainer,
    submissionsContainer,
    requestsContainer,
    submissionRequestsContainer
  };

  next();
};

module.exports = cosmosDB;
