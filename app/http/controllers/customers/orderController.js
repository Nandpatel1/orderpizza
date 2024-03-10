const Order = require("../../../models/order");
const moment = require("moment");

const orderController = () => {
    return {
        async store(req, res) {
            // Validate request
            const { phone, address } = req.body;
            if (!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            });

            try {
                const result = await order.save();
                req.flash('success', 'Order placed successfully');
                delete req.session.cart;
                return res.redirect('/customer/orders');
            }
            catch (err) {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            }
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { createdAt: -1 } });
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders, moment });
        }
    }
}

module.exports = orderController;