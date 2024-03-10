import axios from "axios";
import { Notyf } from 'notyf';
import initAdmin from "./admin";

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter');

const updateCart = async (pizza) => {
    try {
        const res = await axios.post('/update-cart', pizza);
        cartCounter.innerText = res.data.totalQty;
        let notyf = new Notyf({
            duration: 1000,
            position: { x: 'right', y: 'top' },
        });
        notyf.success('Item added to cart');
    } catch (error) {
        let notyf = new Notyf({
            duration: 1000,
            position: { x: 'right', y: 'top' },
        });
        notyf.error('Something went wrong');
    }

}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
    })
})

// Remove alter message after X seconds
const alterMsg = document.querySelector('#success-alert');
if (alterMsg) {
    setTimeout(() => {
        alterMsg.remove();
    }, 2000);
}

initAdmin();