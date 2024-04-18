import { loadStripe } from '@stripe/stripe-js';
import orderAndPayment from './apiService.js';


const initStripe = async () => {
    const stripe = await loadStripe('pk_test_51LE4SgSGeKf1KLraZxM3GXW43yDmHe2yZY8v6dFvdkY17vWs4TNdp4689YYgRo5zYLGAhkmVorhJtW5w39YtZs1Y00KYHBuInB');

    const paymentType = document.querySelector('#paymentType');
    const orderButton = document.querySelector('.btn-primary');
    if (!paymentType) {
        return;
    }
    paymentType.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            orderButton.classList.add('btn-pay-now');
            orderButton.innerText = "Pay now";
        }
        else {
            orderButton.classList.remove('btn-pay-now');
            orderButton.innerText = "Order now";
        }
    });

    // Ajax call
    const paymentForm = document.querySelector('#payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObject = {};

            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            // if (paymentType.value === 'cod') {
            //     orderAndPayment.placeOrder(formObject);
            //     return;
            // }
            try {
                orderAndPayment.placeOrder(formObject);
                return;
            } catch (err) {
                console.log(err);
            }
        });
    }
}

export default initStripe;