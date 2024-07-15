# Kopii Node.js Express.js MySQL API

The backend API for Kopii - Your Gateway To Flavorful Delights, an e-commerce web application capstone project.

Admin panel is separated and built using Laravel with Laravel Jetstream.

Kopii Frontend Repository: [kodego-capstone-kopii-frontend](https://github.com/Taannn/kodego-capstone-kopii-frontend)

Base API Link: [https://kopii-mp2.onrender.com/](https://kopii-mp2.onrender.com/)

Note: first-time usage might take up-to 5 mins or less before it actually works due to render.com's free plan cold start when api is not in use for a certain time duration. This happens only once :)

Example Usage: [https://kopii-mp2.onrender.com/kopii/shop](https://kopii-mp2.onrender.com/kopii/shop)

## Installation

Clone the repository

```bash
git clone https://github.com/Taannn/kodego-kopii-backend.git
cd kodego-kopii-backend
```

  Install dependencies

```bash
  npm install
```

  Setup environment variables:
  - create a .env file in the root directory
  - add the following environment variables
```bash
  PORT=your_chosen_port
  DB_HOST=your_database_host
  DB_USERNAME=your_database_username
  DB_PASSWORD=your_database_password
  DB_NAME=your_database_name
  JWT_SECRET=your_jwt_secret
```
## Technologies Used:
- Node.js
- Express.js
- MySQL
- JSON Web Token for authentication
- bcrypt for password hashing
- dotenv for environment variableas management

## Usage
Start the server

```bash
  npm run dev
```

## Endpoints

### Display products
- GET /kopii/shop - to get all products
- GET /kopii/category/:category - to get all products from a specific category
- GET /kopii/carousel - to get carousel items
- GET /kopii/kopiistopintro - to get kopii shop landing page intro
- GET /kopii/categories - to get all categories
- GET /kopii/kopiihero - to get hero display items
- GET /kopii/featureslist - to get features list
- GET /kopii/featuresdata - to get features about
- GET /kopii/testimonials - to get testimonials
- GET /kopii/discover - to get kopii discover more

### User Authentication
- GET /kopii/settings/userinfo - to get userinfo, must add Bearer Token (valid login) on header to work
- POST /kopii/login - to login user
- POST /kopii/signup - to signup user
- PUT /kopii/update/address/info - to update address info of user, Bearer Token required on header (valid login)
- PUT /kopii/update/password/info - to update password info of user, Bearer Token required on header (valid login)

### Cart Management
- POST /kopii/shop - to get cart products
- GET /kopii/shop/cart - to get user cart products. Bearer Token required
- DELETE /kopii/shop/cart/:product_id - to delete cart item. Bearer Token required
- PUT /kopii/shop/cart/increment/cart_id - to increment cart product quantity. Bearer Token required
- PUT /kopii/shop/cart/increment/cart_id - to increment cart product quantity. Bearer Token required

### Order Management
- GET /kopii/shop/orders - to get user orders. Bearer Token required
- POST /kopii/shop/addorder - to add user order. Bearer Token required
- PUT /kopii/shop/status/update/completed/:order_id - to update order and set it to complete. Bearer Token required
- PUT /kopii/shop/status/update/cancelled/:order_id - to update order and set it to cancelled. Bearer Token required

## License

This project welcomes contributions and feedback for improving the implementation.

## Contributions

Contributions and feedback for improving the implementation are welcome. Feel free to open an issue or submit a pull request with your suggestions.
