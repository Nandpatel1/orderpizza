import axios from "axios";
import { Notyf } from 'notyf';
import initAdmin from "./admin";
import moment from "moment";
import initStripe from "./stripe";
import orderAndPayment from "./apiService";

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

// Change order status
let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');


const updateStatus = (order) => {
    statuses.forEach((status) => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    });
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status;
        if (stepCompleted) {
            status.classList.add('step-completed');
        }
        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
        }
    })
}

updateStatus(order);

initStripe();

orderAndPayment.continueWithCod();

// Socket
let socket = io();

// Join
if (order) {
    socket.emit('join', `order_${order._id}`);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}

socket.on('syncOrderUpdated', (data) => {
    const updatedOrder = { ...order };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
    let notyf = new Notyf({
        duration: 1000,
        position: { x: 'right', y: 'top' },
    });
    notyf.success('Order updated');
})