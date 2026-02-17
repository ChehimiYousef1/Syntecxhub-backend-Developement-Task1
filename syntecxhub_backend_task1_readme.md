# Backend Task1 for Syntecxhub

**Developer:** Youssef El Chehimi  
**Personal Email:** chehimi0303@gmail.com  
**Work Email:** Youssef@openmindsaihamburg.com  
**Phone:** +96171006864  

---

## Project Overview

This project is a **Backend API** for managing users for Syntecxhub. It provides endpoints to create, read, update, delete, and search users in a MongoDB database. The API is built using **Node.js, Express.js, and Mongoose**, following RESTful best practices.  

The API includes robust **error handling** and default endpoints for health checks and testing error scenarios.

---

## API Endpoints

### Users API

| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/users/addNewUser` | Add a new user to the database. |
| **GET** | `/users/getAllUsersRegisteredData` | Retrieve all users from the Users collection. |
| **GET** | `/users/{id}` | Retrieve a specific user by their unique auto-incremented integer `id`. |
| **DELETE** | `/users/{id}` | Delete a specific user by `id` from the Users collection. |
| **PUT** | `/users/{id}` | Update a specific user's data by `id`. The request body can contain any subset of fields (first name, middle name, last name, email, username, gender, date of birth). The response includes both the old and updated user data. |
| **GET** | `/users/search?full_name={query}` | Search for users by full name. The search matches any part of the first, middle, or last name. Returns matched users with full details including `full_name`. |

#### Search Example
```
GET /users/search?full_name=Youssef Khodor
```
Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "full_name": "Youssef Khodor El-Chehimi",
      "date_of_birth": "2002-11-06",
      "gender": "male",
      "email": "chehimi030@gmail.com",
      "user_name": "youssef123"
    }
  ]
}
```

---

### Default API

| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/hello` | Health check endpoint. Returns a custom "hello" message to verify the API is running. |
| **GET** | `/test-error` | Trigger the error handler for testing 404, 400, and 500 response scenarios. Useful for validating API error handling. |

---

## Features

- **Full CRUD for users**:
  - Create new users.
  - Retrieve all users or a specific user by `id`.
  - Update users by `id` with old vs updated data response.
  - Delete users by `id`.
- **Search users by name**:
  - Search supports first, middle, last name, or any combination.
  - Returns matched users with `full_name` for easy display.
- **Error handling**:
  - Handles `404 Not Found`, `400 Bad Request`, and `500 Internal Server Error`.
  - Custom error messages for invalid operations or duplicates.
- **Health check**:
  - Quick endpoint to verify the API is running.

---

## Technologies Used

- **Node.js** - Backend runtime.
- **Express.js** - Web framework for routing and middleware.
- **MongoDB** - Database for storing user data.
- **Mongoose** - ODM for MongoDB.
- **Swagger (OAS 3.0)** - API documentation and testing.

---

## Contact

**Developer:** Youssef El Chehimi  
**Personal Email:** chehimi0303@gmail.com  
**Work Email:** Youssef@openmindsaihamburg.com  
**Phone:** +96171006864

---

> This API is built to support Syntecxhub's user management system, with a focus on scalability, error handling, and professional RESTful design.

