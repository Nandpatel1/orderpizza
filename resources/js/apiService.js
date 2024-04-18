import axios from 'axios';
import { Notyf } from 'notyf';
import { loadStripe } from '@stripe/stripe-js';

const orderAndPayment = {
    placeOrder(formObject) {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        axios.post('/orders', formObject, config).then(async (res) => {
            if (formObject.paymentType === 'card') {
                localStorage.setItem('orderId', JSON.stringify(res.data.orderId));
                this.stripePayment(formObject);
                return;
            }
            let notyf = new Notyf({
                duration: 1000,
                position: { x: 'right', y: 'top' },
            });

            notyf.success(res.data.message);
            setTimeout(() => {
                window.location.href = '/customer/orders';
            }, 1000);
        }).catch((err) => {
            let notyf = new Notyf({
                duration: 1000,
                position: { x: 'right', y: 'top' },
            });
            notyf.error(err.response.data.message);
        });
    },
    async stripePayment(formObject) {
        const { phone, address } = formObject;

        if (!phone || !address) {
            let notyf = new Notyf({
                duration: 1000,
                position: { x: 'right', y: 'top' },
            });
            notyf.error('All fields are required');
            return;
        }
        const params = {
            phone: phone,
            address: address,
            calledFrom: 'stripePayment'
        }
        const stripe = await loadStripe('pk_test_51LE4SgSGeKf1KLraZxM3GXW43yDmHe2yZY8v6dFvdkY17vWs4TNdp4689YYgRo5zYLGAhkmVorhJtW5w39YtZs1Y00KYHBuInB');
        axios.get('/orders', { params }).then(async (res) => {
            const sessionId = res.data.id;
            const result = stripe.redirectToCheckout({
                sessionId
            });
        }).catch((err) => {
            let notyf = new Notyf({
                duration: 1000,
                position: { x: 'right', y: 'top' },
            });
            notyf.error(err.response.data.message);
        });
    },
    continueWithCod() {
        const cancelOrder = document.querySelector('.cancel-order');
        if (!cancelOrder) {
            return;
        }
        cancelOrder.addEventListener('click', (e) => {
            e.preventDefault();
            const orderId = JSON.parse(localStorage.getItem('orderId'));
            localStorage.removeItem('orderId');
            axios.delete(`/orders/${orderId}`).then(res => {
                console.log(res.data);
                let notyf = new Notyf({
                    duration: 1000,
                    position: { x: 'right', y: 'top' },
                });

                notyf.error('Your order is canceled');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }).catch((err) => {
                console.log(err.response.data);
            })
        });
    }
}

export default orderAndPayment;