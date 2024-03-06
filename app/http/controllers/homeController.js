const Menu = require("../../models/menu");

const homeController = () => {
    return {
        index: async (req, res) => {
            const pizzas = await Menu.find();
            return res.render('home', { pizzas });
        }
    }
}

module.exports = homeController;