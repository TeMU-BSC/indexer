db.createUser(
  {
    user: "pingu",
    pwd: "s3crEt!",
    roles: [
      {
        role: "readWrite",
        db: "dev"
      }
    ]
  }
)