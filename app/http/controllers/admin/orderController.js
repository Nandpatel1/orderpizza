const Order = require("../../../models/order")

const orderController = () => {
    return {
        async index(req, res) {
            const orders = await Order.find({ status: { $ne: 'completed' } })
                .sort({ createdAt: -1 })
                .populate('customerId', '-password');
            if (req.xhr) {
                return res.json(orders);
            }
            return res.render('admin/orders');
        }
    }
}

module.exports = orderController;