const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const kopiiController = {
  getAllShopProducts: async (req, res)=>{
    try {
      const sql = "SELECT *, category_name FROM product join category on product.category_id=category.category_id WHERE ordered_from='Kopii Shop';"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No matching record found." });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getAllShopDiscountedProducts: async (req, res)=>{
    try {
      const sql = "SELECT * FROM product WHERE ordered_from='Kopii Shop' AND discount >= 10;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No matching record found." });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getAllStopProducts: async (req, res)=>{
    try {
      const sql = "SELECT * FROM product WHERE ordered_from='Kopii Stop';"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No matching record found." });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getProductsByCategory: async (req, res)=>{
    try {
      const { category } = req.params;
      const sql = "SELECT *, category_name FROM product join category on product.category_id=category.category_id WHERE category_name=?;"
      const [rows, fields] = await pool.query(sql, [category]);
      if (rows.length === 0) {
        res.status(404).json({ error: "No such category found." });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  addToCart: async (req, res) => {
    try {
      const { quantity, product_id } = req.body;
      const { customer_id } = req.user;

      const productQuery = "SELECT * FROM product WHERE product_id = ?;";
      const [product, productFields] = await pool.query(productQuery, [product_id]);

      if (product.length === 0) {
        return res.status(404).json({ error: "Product does not exist" });
      }

      const insertQuery = "INSERT INTO cart (quantity, customer_id, product_id) VALUES (?, ?, ?);";
      const [rows, fields] = await pool.query(insertQuery, [quantity, customer_id, product_id]);

      if (rows.affectedRows === 0) {
        return res.status(404).json({ error: "Invalid Product" });
      } else {
        return res.json({
          data: rows
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error"
      });
    }
  },
  addToCartDuplicate: async (req, res) => {
    try {
      const { quantity, product_id } = req.body;
      const { customer_id } = req.user;

      const existingCartItemQuery = "SELECT * FROM cart WHERE customer_id = ? AND product_id = ?;";
      const [existingCartItem] = await pool.query(existingCartItemQuery, [customer_id, product_id]);

      if (existingCartItem.length > 0) {
        const reqQuantity = parseInt(quantity);
        const updatedQuantity = existingCartItem[0].quantity + reqQuantity;

        const updateQuery = "UPDATE cart SET quantity = ? WHERE customer_id = ? AND product_id = ?;";
        await pool.query(updateQuery, [updatedQuantity, customer_id, product_id]);

        return res.json({ message: "Quantity updated successfully" });
      } else {
        const insertQuery = "INSERT INTO cart (quantity, customer_id, product_id) VALUES (?, ?, ?);";
        await pool.query(insertQuery, [quantity, customer_id, product_id]);

        return res.json({ message: "Product added to cart successfully" });
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getShopCustomerCart: async (req, res)=>{
    try {
      const { customer_id } = req.user;
      const sql = `
        SELECT
          c.cart_id,
          c.quantity,
          p.product_id,
          p.discount,
          p.product_name,
          p.product_desc,
          p.product_price,
          p.product_stock,
          p.product_img,
          p.product_rating,
          p.ordered_from,
          cat.category_name
        FROM
          cart c
        JOIN
          product p
        ON
          c.product_id = p.product_id
        JOIN
          category cat
        ON
          p.category_id = cat.category_id
        WHERE
          c.customer_id = ? and p.ordered_from='Kopii Shop';`
      const [rows, fields] = await pool.query(sql, [customer_id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Cart is empty" });
      } else {
        return res.json({
          data: rows
        })
      }
    } catch (error) {
      return res.json({
        status: error
      })
    }
  },
  getStopCustomerCart: async (req, res)=>{
    const { customer_id } = req.user;
    try {
      const sql = "SELECT c.cart_id,c.quantity,p.product_id,p.discount,p.product_name,p.product_desc,p.product_price,p.product_stock,p.product_img,p.product_rating,p.ordered_from,cat.category_name FROM cart c JOIN product p ON c.product_id = p.product_id JOIN category cat ON p.category_id = cat.category_id WHERE c.customer_id = ? and p.ordered_from='Kopii Stop';"
      const [rows, fields] = await pool.query(sql, [customer_id]);
      if (rows.length === 0) {
        res.status(404).json({ error: "Cart is empty" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  deleteFromCart: async (req, res)=>{
    try {
      const { product_id } = req.params;
      const { customer_id } = req.user;
      const sql = "delete from cart where customer_id=? and product_id=?"
      const [rows, fields] = await pool.query(sql, [customer_id, product_id]);
      if (rows.length === 0) {
        res.status(404).json({ error: "No matching Item found." });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  cartIncrement: async (req, res) => {
    try {
      const { cart_id } = req.params;
      const cartQuery = "SELECT * FROM cart WHERE cart_id = ?;";
      const [cart, cartFields] = await pool.query(cartQuery, [cart_id]);

      if (cart.length === 0) {
        return res.status(404).json({ error: "Cart item does not exist" });
      }

      const { quantity } = cart[0];
      if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity cannot be incremented for this item" });
      }

      const incrementQuery = "UPDATE cart SET quantity = quantity + 1 WHERE cart_id = ?;";
      await pool.query(incrementQuery, [cart_id]);

      return res.json({ message: "Cart quantity incremented successfully" });
    } catch (error) {
      console.error("Error incrementing cart quantity:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  cartDecrement: async (req, res) => {
    try {
      const { cart_id } = req.params;

      const cartQuery = "SELECT * FROM cart WHERE cart_id = ?;";
      const [cart, cartFields] = await pool.query(cartQuery, [cart_id]);

      if (cart.length === 0) {
        return res.status(404).json({ error: "Cart item does not exist" });
      }

      const { quantity } = cart[0];
      if (quantity <= 1) {
        return res.status(400).json({ error: "Quantity cannot be decremented further for this item" });
      }

      const decrementQuery = "UPDATE cart SET quantity = quantity - 1 WHERE cart_id = ?;";
      await pool.query(decrementQuery, [cart_id]);

      return res.json({ message: "Cart quantity decremented successfully" });
    } catch (error) {
      console.error("Error decrementing cart quantity:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getCarousel: async (req, res)=>{
    try {
      const sql = "SELECT * FROM carousel_data"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getCategories: async (req, res)=>{
    try {
      const sql = "SELECT * FROM categories;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getKopiiStopIntro: async (req, res)=>{
    try {
      const sql = "SELECT * FROM kopii_stop_intro;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getKopiiHero: async (req, res)=>{
    try {
      const sql = "SELECT * FROM kopii_hero;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getFeaturesList: async (req, res)=>{
    try {
      const sql = "SELECT * FROM features_list;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getFeaturesData: async (req, res)=>{
    try {
      const sql = "SELECT * FROM features_data;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getTestimonials: async (req, res)=>{
    try {
      const sql = "SELECT * FROM testimonials;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getDiscover: async (req, res)=>{
    try {
      const sql = "SELECT * FROM discover;"
      const [rows, fields] = await pool.query(sql);
      if (rows.length === 0) {
        res.status(404).json({ error: "No Data to fetch" });
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.json({
        status: error
      })
    }
  },
  getCustomerInfo: async (req, res)=>{
    try {
      const { customer_id } = req.user;
      const sql = "SELECT first_name, last_name, email, address, phone_number, city, zip_code FROM customer WHERE customer_id=?;";
      const [rows, fields] = await pool.query(sql, [customer_id]);
      if (rows.length === 0) {
        req.status(404).json({ error: "User not found" });
        return;
      } else {
        res.json({
          data: rows
        })
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  updateCustomer: async (req, res) => {
    try {
        const { address, city, phone_number, zip_code } = req.body;
        const { customer_id } = req.user;

        const updateQuery = "UPDATE customer SET address = ?, city = ?, phone_number = ?, zip_code = ? WHERE customer_id = ?;";
        const [result] = await pool.query(updateQuery, [address, city, phone_number, zip_code, customer_id]);

        if (result.affectedRows > 0) {
            return res.json({ message: "Customer information updated successfully" });
        } else {
            return res.status(404).json({ error: "Customer not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
  },
  customerLogin: async (req, res)=>{
    try {
      const { email, password } = req.body;
      const sql = "SELECT * FROM customer WHERE email = ?;"
      const [rows, fields] = await pool.query(sql, [email]);
      if (rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = rows[0];
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
      // dont forget the return here for each erro handling, else you'll face server issues agai stopping whenever this statement status  is sent

      const token = jwt.sign({ customer_id: user.customer_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({
        token,
        customer_id: user.customer_id,
        expiresIn:  3600
      });

    } catch (error) {
      res.status(500).json({ error: "Interval server error" })
    }
  },
  customerSignup: async (req, res)=>{
    try {
      const { first_name, last_name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const checkEmailExists = async (email) => {
        const [rows, fields] = await pool.execute('SELECT COUNT(*) as count FROM customer WHERE email = ?', [email]);
        const count = rows[0].count;
        return count > 0;
      };
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return res.status(400).json({ error: "DuplicateEmailError", message: "Email is already registered." });
      }

      const sql = "INSERT INTO customer (first_name, last_name, email, password) VALUES (?, ?, ?, ?);"
      const [rows, fields] = await pool.query(sql, [first_name, last_name, email, hashedPassword]);

      res.json({
        message: "User Registered Successfully."
      })
    } catch (error) {
      res.status(500).json({ error: "Interval server error" })
    }
  },
  addShopOrder: async (req, res) => {
    try {
      const { product_id, quantity, price } = req.body;
      const { customer_id } = req.user;

      const insertOrder = "INSERT INTO customer_orders (customer_id, product_id, quantity, price, created_at, status, status_message) VALUES (?, ?, ?, ?, NOW(), ?, ?);";
      const [orderResult, orderFields] = await pool.query(insertOrder, [customer_id, product_id, quantity, price, 'To Ship', 'Your order is being prepared for shipment' ]);

      // retrieve the last inserted id
      const lastInsertedOrderId = orderResult.insertId;

      const { address, city, zip_code } = req.body;

      const randomDays = Math.floor(Math.random() * 7);
      const shipmentDateRng = randomDays + 1;

      const insertShipmentQuery = "INSERT INTO shipment (order_id, shipment_date, address, city, zip_code, customer_id) VALUES (?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?, ?, ?);";
      await pool.query(insertShipmentQuery, [lastInsertedOrderId, shipmentDateRng, address, city, zip_code, customer_id]);


      const { payment_method } = req.body;
      const insertPaymentQuery = "INSERT INTO payment (order_id, payment_method, amount, customer_id) VALUES (?, ?, ?, ?);";
      await pool.query(insertPaymentQuery, [lastInsertedOrderId, payment_method, price, customer_id]);

      return res.json({
        message: "Order added successfully",
        // order_id: lastInsertedOrderId
      });
    } catch (error) {
      console.error("Error adding order:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  updateOrderStatusCancelled: async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status_message } = req.body;

      const updateOrderQuery = "UPDATE customer_orders SET status = ?, status_message = ?, updated_at = NOW() WHERE order_id = ?";
      await pool.query(updateOrderQuery, ["Cancelled", status_message, order_id]);

      return res.json({
        message: "Order status updated successfully"
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  updateOrderStatusCompleted: async (req, res) => {
    try {
      const { order_id } = req.params;

      const updateOrderQuery = "UPDATE customer_orders SET status = ?, status_message = ?, updated_at = NOW() WHERE order_id = ?";
      await pool.query(updateOrderQuery, ["Completed", 'Order received on: ', order_id]);

      return res.json({
        message: "Order status updated successfully"
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getShopCustomerOrders: async (req, res) => {
    try {
      const { customer_id } = req.user;

      const sql = `
          SELECT
            co.order_id,
            co.customer_id,
            co.product_id,
            co.quantity,
            co.price,
            co.created_at,
            co.updated_at,
            co.status,
            co.status_message,
            s.shipment_id,
            s.shipment_date,
            s.address,
            s.city,
            s.zip_code,
            p.payment_id,
            p.payment_date,
            p.payment_method,
            p.amount,
            pr.product_name,
            pr.product_desc,
            pr.product_img,
            pr.product_price,
            pr.discount
        FROM
            customer_orders co
        JOIN
            shipment s ON co.order_id = s.order_id
        JOIN
            payment p ON co.order_id = p.order_id
        JOIN
            product pr ON co.product_id = pr.product_id
        WHERE
            co.customer_id = ?;
      `;

      const [rows, fields] = await pool.query(sql, [customer_id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "No orders found for this customer" });
      }

      return res.json({ data: rows });
    } catch (error) {
      console.error("Error retrieving customer orders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { current_password, password } = req.body;
      const { customer_id } = req.user;

      const [customerRows, customerFields] = await pool.query("SELECT * FROM customer WHERE customer_id = ?;", [customer_id]);
      if (customerRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const customer = customerRows[0];

      const isPasswordMatch = await bcrypt.compare(current_password, customer.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ error: "PasswordMismatchError", message: "Current password is incorrect." });
      }

      const isNewPasswordSame = await bcrypt.compare(password, customer.password);
      if (isNewPasswordSame) {
        return res.status(400).json({ error: "SamePasswordError", message: "New password cannot be the same as the current password." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query("UPDATE customer SET password = ? WHERE customer_id = ?;", [hashedPassword, customer_id]);

      res.json({
        message: "Password updated successfully."
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = kopiiController;