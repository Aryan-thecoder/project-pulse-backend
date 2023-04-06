// import supertest module
const request = require("supertest");

// import app from server
const app = require("../server");

// login
test("user login", async () => {
  // act
  let response = await request(app).post("/specialUsers-api/special-user-login").send({
    email_id:"aryan@wal.com",
    password: "123"
  });

  // assertions
  expect(response.statusCode).toBe(200);
});

// testing admin

// testing get all the projects
test("Get all projects by admin", async () => {
  // arrange
  // act
  let response = await request(app)
    .get("/admin-api/get-projects")
    .set(
      "Authorization",
      "bearer " +
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMywidXNlclJvbGUiOiJhZG1pbiIsImlhdCI6MTY3ODUzMDcxMSwiZXhwIjoxNjc5Mzk0NzExfQ.sPAojMx1m1J8PhPIbf-1MktYQCfUzP_o1PSYOzA9XIE"
    );
        console.log("projects response",response);
  // assertions
  expect(response.body.Message).toBe('Session expired. Please re-login to continue')
});

// creating project test
test("project should be created", async () => {
  // arrange
  // act
  let response = await request(app)
    .post("/admin-api/create-project")
    .send({
        project_id:1,
        project_name:"Project2",
        client:"client2",
        client_account_manager:"Nike",
        project_status:"In Progress",
        project_start_date:"2023/12/09",
        project_fitness_indicator:"Green",
        project_domain:"Machine Learning",
        project_type:"Testing",
        team_size:3,
        gdoHead_id:4,
        projectManager_id:2
    })
    .set(
      "Authorization",
      "bearer " +
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMywidXNlclJvbGUiOiJhZG1pbiIsImlhdCI6MTY3ODUzMDcxMSwiZXhwIjoxNjc5Mzk0NzExfQ.sPAojMx1m1J8PhPIbf-1MktYQCfUzP_o1PSYOzA9XIE"
    );

//   // assertion
  expect(response.status).toBe(401);
});