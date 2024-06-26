const Order = require("../../../models/order");

const statusController = () => {
    return {
        async update(req, res) {
            try {
                const res = await Order.updateOne(
                    { _id: req.body.orderId },
                    { status: req.body.status }
                );
                // Emit event
                const eventEmitter = req.app.get('eventEmitter');
                console.log('eventStauts: ', req.app);
                console.log('emitterStatus: ', eventEmitter);
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });

                return res.redirect('/admin/orders')
            }
            catch (err) {
                return res.redirect('/admin/orders')
            }
        }
    }
}

module.exports = statusController;