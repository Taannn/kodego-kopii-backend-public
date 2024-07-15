const express = require('express');
const router = express();
// it has something to do with router so we call it router and not app
const authenticateUser = require('../middleware/authMiddleware')

// we need controller
// /if we have routes, we need a controller to handle them
const kopiiController = require('../controller/kopii.controller');

// ROUTES

// for display only
router.get("/shop", kopiiController.getAllShopProducts);
router.get("/shop/highrated", kopiiController.getAllShopDiscountedProducts);
router.get("/stop", kopiiController.getAllStopProducts);
router.get("/shop/category/:category", kopiiController.getProductsByCategory);
router.get("/carousel", kopiiController.getCarousel);
router.get("/categories", kopiiController.getCategories);
router.get("/kopiistopintro", kopiiController.getKopiiStopIntro);
router.get("/kopiihero", kopiiController.getKopiiHero);
router.get("/featureslist", kopiiController.getFeaturesList);
router.get("/featuresdata", kopiiController.getFeaturesData);
router.get("/testimonials", kopiiController.getTestimonials);
router.get("/discover", kopiiController.getDiscover);

// for customer info

router.get("/settings/userinfo", authenticateUser, kopiiController.getCustomerInfo);
router.post("/login", kopiiController.customerLogin);
router.post("/signup", kopiiController.customerSignup);
router.put("/update/address/info", authenticateUser, kopiiController.updateCustomer);
router.put("/update/password/info", authenticateUser, kopiiController.resetPassword);

// for cart

router.post("/shop/", authenticateUser, kopiiController.addToCartDuplicate);
router.get("/shop/cart", authenticateUser, kopiiController.getShopCustomerCart);
router.get("/stop/cart", authenticateUser, kopiiController.getStopCustomerCart);
router.delete("/shop/cart/:product_id", authenticateUser, kopiiController.deleteFromCart);
router.put("/shop/cart/increment/:cart_id", kopiiController.cartIncrement);
router.put("/shop/cart/decrement/:cart_id", kopiiController.cartDecrement);

// for orders

router.get("/shop/orders", authenticateUser, kopiiController.getShopCustomerOrders);
router.post("/shop/addorder",authenticateUser, kopiiController.addShopOrder);
router.put("/shop/status/update/completed/:order_id", authenticateUser, kopiiController.updateOrderStatusCompleted);
router.put("/shop/status/update/cancelled/:order_id", authenticateUser, kopiiController.updateOrderStatusCancelled);

module.exports = router;