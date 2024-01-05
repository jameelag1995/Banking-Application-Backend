# Bank API Server Documentation

-   Link to the Project: https://easy-blue-cockroach-coat.cyclic.app/api/v1

## Overview

This API provides basic functionalities for managing users in a banking system. Each user has a unique ID, full name, cash amount, credit amount, and an isActive status.

## Endpoints

### 1. Get All Users

-   **Endpoint**: `GET /api/v1/bank`
-   **Description**: Retrieve a list of all users.
-   **Response**: Array of user objects.

### 1. Get All Active Users

-   **Endpoint**: `GET /api/v1/bank/users/active`
-   **Description**: Retrieve a list of all active users.
-   **Response**: Array of user objects.

### 1. Get All Users

-   **Endpoint**: `GET /api/v1/bank/users/inactive`
-   **Description**: Retrieve a list of all inactive users.
-   **Response**: Array of user objects.

### 1. Create User

-   **Endpoint**: `POST /api/v1/bank`
-   **Request Body**: `{ "fullName": <userFullName>,"cash": <initialCash>,"credit": <initialCredit> }`
-   **Description**: Creates new user with unique id, full name, cash and credit (default 0) and isActive.
-   **Response**: Created user object.

### 2. Get User by ID

-   **Endpoint**: `GET /api/v1/bank/:id`
-   **Parameters**: `id` (User ID)
-   **Description**: Retrieve a user by their unique ID.
-   **Response**: User object.

### 3. Deposit to Cash

-   **Endpoint**: `PUT /api/v1/bank/deposit/:id`
-   **Parameters**: `id` (User ID)
-   **Request Body**: `{ "amount": <depositAmount> }`
-   **Description**: Deposit money to a user's cash balance.
-   **Response**: Updated user object.

### 4. Update Credit

-   **Endpoint**: `PUT /api/v1/bank/update-credit/:id`
-   **Parameters**: `id` (User ID)
-   **Request Body**: `{ "amount": <newCreditAmount> }`
-   **Description**: Update a user's credit balance.
-   **Response**: Updated user object.

### 5. Withdraw from Cash

-   **Endpoint**: `PUT /api/v1/bank/withdraw/:id`
-   **Parameters**: `id` (User ID)
-   **Request Body**: `{ "amount": <withdrawAmount> }`
-   **Description**: Withdraw money from a user's cash balance. If insufficient cash, withdraw from credit.
-   **Response**: Updated user object.

### 6. Transfer Money

-   **Endpoint**: `PUT /api/v1/bank/transfer`
-   **Request Body**: `{ "senderId": <senderUserId>, "receiverId": <receiverUserId>, "amount": <transferAmount> }`
-   **Description**: Transfer money from one user to another. If insufficient cash, use credit.
-   **Response**: Updated user objects for sender and receiver.

### 7. Activate User

-   **Endpoint**: `PUT /api/v1/bank/activate/:id`
-   **Parameters**: `id` (User ID)
-   **Description**: Activate a user.
-   **Response**: Updated user object.

### 8. Deactivate User

-   **Endpoint**: `PUT /api/v1/bank/deactivate/:id`
-   **Parameters**: `id` (User ID)
-   **Description**: Deactivate a user.
-   **Response**: Updated user object.

### 9. Filter Active Users by Balance

-   **Endpoint**: `GET /api/v1/bank/filter/by?filterType=balance&min=MinAmount&max=MaxAmount - Shows Active Users with Given Balance`
-   **Query**: `filterType,min,max` (minimum and maximum required balance)
-   **Description**: Filter active users based on their total balance (sum of credit and cash).
-   **Response**: Array of user objects.

### 10. Filter Active Users by Cash

-   **Endpoint**: `GET /api/v1/bank/filter/by?filterType=cash&min=MinAmount&max=MaxAmount - Shows Active Users with Given Cash`
-   **Query**: `filterType,min,max` (minimum and maximum required cash)
-   **Description**: Filter active users based on their cash balance.
-   **Response**: Array of user objects.

### 11. Filter Active Users by Credit

-   **Endpoint**: `GET /api/v1/bank/filter/by?filterType=credit&min=MinAmount&max=MaxAmount - Shows Active Users with Given Credit`
-   **Query**: `filterType,min,max` (minimum and maximum required credit)
-   **Description**: Filter active users based on their credit balance.
-   **Response**: Array of user objects.

## Error Handling

All possible errors are handled using an error handler middleware. The API returns appropriate error responses with status codes and error messages.
