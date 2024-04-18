const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const orderController = {
    createOrder(customerId, items, phone, address) {
        return new Order({
            customerId,
            items,
            phone,
            address,
        });
    },
    async store(req, res) {
        try {
            // Validate request
            const { phone, address, paymentType } = req.body;

            if (!phone || !address) {
                return res.status(422).json({ message: 'All fields are required' });
            }
            const order = this.createOrder(req.user._id, req.session.cart.items, phone, address);
            const placedOrder = await this.saveOrder(order);

            req.session.currentOrderId = placedOrder._id;

            if (paymentType === 'cod') {
                this.emitOrderPlaced(req.app.get('eventEmitter'), placedOrder);
                delete req.session.cart;
                return res.json({ message: 'Payment successful, Order placed successfully', orderId: req.session.currentOrderId });
            } else {
                return res.json({ message: 'Order placed', orderId: req.session.currentOrderId });
            }
        } catch (err) {
            console.error('Error processing order:', err);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },
    async saveOrder(order) {
        const result = await order.save();
        return await Order.populate(result, { path: 'customerId' });
    },
    emitOrderPlaced(eventEmitter, placedOrder) {
        eventEmitter.emit('orderPlaced', placedOrder);
    },
    async index(req, res) {
        const orders = await Order.find({ customerId: req.user._id }, null, { sort: { createdAt: -1 } });
        res.header('Cache-Control', 'no-store')
        res.render('customers/orders', { orders, moment });
    },
    async show(req, res) {
        const order = await Order.findById(req.params.id);

        // Authorize user
        if (order.customerId.toString() === req.user._id.toString()) {
            return res.render('customers/singleOrder', { order });
        }
        return res.redirect('/');
    },
    // Get request of '/orders' from apiService
    async createStripePayment(req, res) {
        const { phone, address, calledFrom } = req.query;
        if (calledFrom !== 'stripePayment') {
            return res.redirect('/');
        }
        let products = Object.values(req.session.cart.items);
        if (!phone || !address) {
            return res.status(422).json({ message: 'All fields are required' });
        }

        const lineItems = products.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product.item.name,
                },
                unit_amount: product.item.price * 100,
            },
            quantity: product.qty
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "http://localhost:3000/paymentStatus?status=success&session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3000/paymentStatus?status=failure&session_id={CHECKOUT_SESSION_ID}",
        });

        return res.json({ id: session.id });
    },
    // Called by stripe
    async paymentStatus(req, res) {
        try {
            const sessionId = req.query.session_id;
            if (!sessionId) {
                throw new Error('Session ID is required');
            }
            const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
            let paymentData;
            if (session.payment_status === 'paid') {
                const currentOrder = await Order.findById(req.session.currentOrderId);
                const placedOrder = await Order.populate(currentOrder, { path: 'customerId' });
                placedOrder.paymentStatus = true;
                placedOrder.paymentType = 'card';
                await placedOrder.save();
                // const eventEmitter = req.app.get('eventEmitter');
                const eventEmitter = global.eventEmitter;

                eventEmitter.emit('orderPlaced', placedOrder);
                delete req.session.currentOrderId;
                delete req.session.cart;
                paymentData = {
                    status: 'success',
                    paymentStatus: 'Payment Successful !',
                    message: 'Thank you for your payment. Your transaction was successful.',
                    icon: 'check'
                }
                return res.render('paymentStatus', { paymentData });
            } else {
                paymentData = {
                    status: 'failure',
                    paymentStatus: 'Payment Failed !',
                    message: ['Payment processing encountered an error.', 'Your order has been successfully placed', 'with', "'Pay on delivery'", 'option. Thank you for your patience.'],
                    icon: 'cross'
                }
                return res.render('paymentStatus', { paymentData });
            }
        } catch (error) {
            console.error('Error retrieving payment status:', error);
            return res.status(500).send('Internal Server Error');
        }
    },
    async deleteOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const deletedOrder = await Order.findOneAndDelete({ _id: orderId });
            res.status(200).json({ message: 'Order deleted successfully.' });
        } catch (err) {
            console.error('Error deleting order:', err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = orderController;