const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const homeController = require("../app/http/controllers/homeController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");

// Middlewares
const auth = require("../app/http/middlewares/auth");
const guest = require("../app/http/middlewares/guest");
const admin = require("../app/http/middlewares/admin");

const initRoute = (app) => {
    app.get('/', homeController().index);
    app.get('/login', guest, authController().login);
    app.post('/login', authController().postLogin);
    app.get('/register', guest, authController().register);
    app.post('/register', authController().postRegister);
    app.post('/logout', authController().logout);

    app.get('/cart', cartController().index);
    app.post('/update-cart', cartController().update);

    // Customer routes
    app.post('/orders', orderController.store.bind(orderController));
    // app.post('/orders', orderController.store);
    app.get('/orders', orderController.createStripePayment);
    app.get('/customer/orders', auth, orderController.index);
    app.get('/customer/orders/:id', auth, orderController.show);

    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index);
    app.post('/admin/order/status', admin, statusController().update);

    // Delete order
    app.delete('/orders/:orderId', orderController.deleteOrder);

    // Stripe Payment
    app.get('/paymentStatus', orderController.paymentStatus);
}

module.exports = initRoute;