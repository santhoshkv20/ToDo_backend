# API Details

1. Signup

- POST http://localhost:4000/user/signup

```
Request body
{
    "name":"user",
    "email":"user@hmail.com"
    "password":"sometestpassword"
}

Respose body

{
    "status": "Signup successfull",
    "user": {
        "email": "user@gmail.com,
        "name": "user",
        "isVerified": false
    }
}
OTP will be sent to email address(valid for 1 hour)
```
2. Verify OTP
- POST http://localhost:4000/user/verifyOtp
```

Request body

{
    "email":"user@gmail.com",
    "otp":986613
}

Response body

{
    "status": "Success",
    "msg": "OTP successfully  verified"
}
```
3. Signin
- POST http://localhost:4000/user/signin
```
Request body
    {   
        "email":"user@gmail.com",
        "password":"sometestpassword"
    }

    Respose body
    {
    "status": "SUCCESS",
    "user": {
        "email": "user@gmail.com",
        "name": "user",
        "isVerified": true,
        "token": "eyJhbGciOiJIUzI1NiJ9.c2FudGhvc2hrdjI5OEBnbWFpbC5jb21za3Y4NDkyQDIw.OZ6IEISDTJYCI0M1O5lYHSQCU8pFLdu9IcSybrzeps0"
    }
}
After signin, token must sent with every request in Header(Authorization)
```

4. Adding new Todo task
- POST http://localhost:4000/task/newtodo
```
Request body

{
    "taskName":"Reading books",
    "date":Date,
    "status":"incomplete"

}

Response body

{
    "task": [
        {
            "taskName": "Reading books",
            "date": "1970-01-20T09:54:04.992Z",
            "status": "incomplete",
            "_id": "63f8ba41fc47bfc83cf801dc"
        },
}
```
5. List all task
- GET http://localhost:4000/task/getAllTodo/?startLimit=0&endLimit=3

```
Response body
{
    "Alltask": [
        {
            "taskName": "Reading books",
            "date": "1970-01-20T09:54:04.992Z",
            "status": "incomplete",
            "_id": "63f8ba41fc47bfc83cf801dc"
        },
        {
            "taskName": "test9",
            "date": "1970-01-20T09:54:05.004Z",
            "status": "incomplete",
            "_id": "63f8ba4cfc47bfc83cf801e0"
        },
        {
            "taskName": "test0",
            "date": "1970-01-20T09:54:05.009Z",
            "status": "incomplete",
            "_id": "63f8ba51fc47bfc83cf801e5"
        }
    ]
}
```
6. Update task
- POST  http://localhost:4000/task/updateTask/63f8ba41fc47bfc83cf801dc
```
Request body
{
    "taskName":"Reading books",
    "date":"12-8-22",
    "status":"completed"
}

Respose body

{
    "status": "Success",
    "msg": "Task updated successfully"
}
```
7. Delete task
- http://localhost:4000/task/deletTodo/63f77181380f7bc041941c6b

```
Response body(updated all task will be sent)
{
    "allTask": [
        {
            "taskName": "test9",
            "date": "1970-01-20T09:54:05.004Z",
            "status": "incomplete",
            "_id": "63f8ba4cfc47bfc83cf801e0"
        },
        {
            "taskName": "test0",
            "date": "1970-01-20T09:54:05.009Z",
            "status": "incomplete",
            "_id": "63f8ba51fc47bfc83cf801e5"
        }
    ]
}
```
8. Sort tasks
- http://localhost:4000/task/sortTask
```
Request body(array of task ids must be sent in body)

[
"63f8ba51fc47bfc83cf801e5",
"63f8ba4cfc47bfc83cf801e0"
]

Response body

{
    "taskUpdated": [
        {
            "taskName": "test0",
            "date": "1970-01-20T09:54:05.009Z",
            "status": "incomplete",
            "_id": "63f8ba51fc47bfc83cf801e5"
        },
        {
            "taskName": "test9",
            "date": "1970-01-20T09:54:05.004Z",
            "status": "incomplete",
            "_id": "63f8ba4cfc47bfc83cf801e0"
        }
    ]
}
```

9. Logout user
- POST http://localhost:4000/user/logout
```
Response body

{
    "status": "Logged out",
    "msg": "your logged out successfully"
}


```
10. Regenarate OTP
- POST http://localhost:4000/user/regenareteOtp
```
Request body

{
    "email":"user@gmail.com"
}

Response body

{
    "staus": "success",
    "msg": "OTP send succeaafully"
}
```
