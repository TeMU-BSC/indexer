db.createUser(
  {
    user: "dummy",
    pwd: "dummyPassword",
    roles: [
      {
        role: "readWrite",
        db: "demo"
      }
    ]
  }
)