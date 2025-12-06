let cart = [];
let total = 0;

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;

    updateCart();
}

function updateCart() {
    const list = document.getElementById("cart-list");
    const totalText = document.getElementById("total");

    list.innerHTML = "";

    cart.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - ${item.price}đ`;
        list.appendChild(li);
    });

    totalText.textContent = "Tổng: " + total.toLocaleString() + "đ";
}
