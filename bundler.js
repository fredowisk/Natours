require('@babel/polyfill');
const $3Wh04$axios = require('axios');

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/* eslint-disable*/ 
/* eslint-disable */ const $2b39ca410fbf1550$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = "pk.eyJ1IjoiZnJlZG93aXNrIiwiYSI6ImNrdjhuOHZvejAyOWoyeG5vanlkZGxxNXgifQ.mES_ZhZPY6QDTYyBOpJANQ";
    const [lat, lng] = locations[0].coordinates;
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/fredowisk/ckv8r3mv58bbk14piycgv6uhj",
        zoom: 1,
        scrollZoom: false
    });
    const newButton = document.getElementById("zoom");
    newButton.addEventListener("click", ()=>{
        locations.forEach((location)=>{
            const el = document.createElement("div");
            el.className = "marker";
            new mapboxgl.Marker({
                element: el,
                anchor: "bottom"
            }).setLngLat(location.coordinates).addTo(map);
            new mapboxgl.Popup({
                offset: 30
            }).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`).addTo(map);
        });
        map.flyTo({
            center: [
                lat,
                lng
            ],
            zoom: 6,
            bearing: 0,
            speed: 1,
            easing: (t)=>t,
            essential: true,
            padding: {
                top: 400,
                bottom: 200,
                left: 100,
                right: 100
            }
        });
        newButton.style.display = "none";
    });
};


/* eslint-disable*/ 
/*eslint-disable*/ const $205558e491d64dcb$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};
const $205558e491d64dcb$export$de026b00723010c1 = (type, message, time = 7)=>{
    $205558e491d64dcb$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${message}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout($205558e491d64dcb$export$516836c6a9dfc573, time * 1000);
};


const $7483b2cfd4cf6ab9$export$596d806903d1f59e = async (email, password)=>{
    try {
        const result = await (0, ($parcel$interopDefault($3Wh04$axios)))({
            method: "POST",
            url: "/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        if (result.data.status === "success") {
            (0, $205558e491d64dcb$export$de026b00723010c1)("success", "Logged in successfully!");
            window.setTimeout(()=>{
                // eslint-disable-next-line no-restricted-globals
                location.assign("/");
            }, 1500);
        }
    } catch (error) {
        (0, $205558e491d64dcb$export$de026b00723010c1)("error", error.response.data.message);
    }
};
const $7483b2cfd4cf6ab9$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await (0, ($parcel$interopDefault($3Wh04$axios)))({
            method: "get",
            url: "/api/v1/users/logout"
        });
        //the reload code is super important, because it will reload all the cache
        //and not simply reload the page
        if (res.data.status === "success") location.reload(true);
    } catch (error) {
        (0, $205558e491d64dcb$export$de026b00723010c1)("error", "Error loggint out! Try again.");
    }
};


/* eslint-disable */ 

const $97cbf93f5bf40120$export$ca89bc660948fd97 = async (data)=>{
    try {
        const result = await (0, ($parcel$interopDefault($3Wh04$axios)))({
            method: "PATCH",
            url: "/api/v1/users/updateMe",
            data: data
        });
        if (result.data.status === "success") (0, $205558e491d64dcb$export$de026b00723010c1)("success", "Account updated successfully!");
    } catch (error) {
        (0, $205558e491d64dcb$export$de026b00723010c1)("error", error.response.data.message);
    }
};
const $97cbf93f5bf40120$export$e6af0f282bef35a9 = async (oldPassword, newPassword, newPasswordConfirmation)=>{
    try {
        const result = await (0, ($parcel$interopDefault($3Wh04$axios)))({
            method: "PATCH",
            url: "/api/v1/users/updatePassword",
            data: {
                oldPassword: oldPassword,
                newPassword: newPassword,
                newPasswordConfirmation: newPasswordConfirmation
            }
        });
        if (result.data.status === "success") (0, $205558e491d64dcb$export$de026b00723010c1)("success", "Password updated successfully!");
    } catch (error) {
        (0, $205558e491d64dcb$export$de026b00723010c1)("error", error.response.data.message);
    }
};


/*eslint-disable*/ 

const $dfa7dc58f59e946c$var$stripe = Stripe("pk_test_51Ju4syCxZBGB882laYkpbTlJpD80i5TElbw2A83xJMZAX1hvr5kMoS0fOoGtwtdzK5jj4w3NUoIc3NSOZmbmNaAm00qLIxFEcB");
const $dfa7dc58f59e946c$export$8d5bdbf26681c0c2 = async (tourId)=>{
    try {
        //Get the checkout session from the server(API)
        const session = await (0, ($parcel$interopDefault($3Wh04$axios)))(`/api/v1/bookings/checkout-session/${tourId}`);
        //Create checkout form + charge credit card
        await $dfa7dc58f59e946c$var$stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (error) {
        (0, $205558e491d64dcb$export$de026b00723010c1)("error", error);
    }
};



/* eslint-disable*/ 

const $570385a58432f766$export$6f5378aa3397b877 = async (name, email, password, passwordConfirmation)=>{
    try {
        const result = await (0, ($parcel$interopDefault($3Wh04$axios)))({
            method: "POST",
            url: "/api/v1/users/signup",
            data: {
                name: name,
                email: email,
                password: password,
                passwordConfirmation: passwordConfirmation
            }
        });
        if (result.data.status === "success") {
            (0, $205558e491d64dcb$export$de026b00723010c1)("success", "Account successfully created! \n Please confirm your e-mail.");
            window.setTimeout(()=>{
                // eslint-disable-next-line no-restricted-globals
                location.assign("/");
            }, 1500);
        }
    } catch (error) {
        (0, $205558e491d64dcb$export$de026b00723010c1)("error", error.response.data.message);
    }
};


//DOM ELEMENTS
const $0839f7a1410e33a8$var$mapBox = document.getElementById("map");
const $0839f7a1410e33a8$var$loginForm = document.querySelector(".form--login");
const $0839f7a1410e33a8$var$signUpForm = document.querySelector(".form--sign-up");
const $0839f7a1410e33a8$var$logoutButton = document.querySelector(".nav__el--logout");
const $0839f7a1410e33a8$var$updateUserForm = document.querySelector(".form-user-data");
const $0839f7a1410e33a8$var$updatePasswordForm = document.querySelector(".form-user-settings");
const $0839f7a1410e33a8$var$bookButton = document.getElementById("book-tour");
//Delegation
if ($0839f7a1410e33a8$var$mapBox) {
    const locations = JSON.parse($0839f7a1410e33a8$var$mapBox.dataset.locations);
    (0, $2b39ca410fbf1550$export$4c5dd147b21b9176)(locations);
}
if ($0839f7a1410e33a8$var$loginForm) {
    const input = document.getElementsByTagName("input")[1];
    const icon = document.getElementById("password-icon");
    icon.addEventListener("click", ()=>{
        if (input.type === "password") {
            input.type = "text";
            icon.firstChild.attributes[0].nodeValue = "/img/icons.svg#icon-eye-off";
        } else {
            input.type = "password";
            icon.firstChild.attributes[0].nodeValue = "/img/icons.svg#icon-eye";
        }
    });
    $0839f7a1410e33a8$var$loginForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        (0, $7483b2cfd4cf6ab9$export$596d806903d1f59e)(email, password);
    });
}
if ($0839f7a1410e33a8$var$signUpForm) {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const passwordConfirmation = document.getElementById("passwordConfirmation");
    const icon = document.querySelectorAll("#password-icon");
    icon[0].addEventListener("click", ()=>{
        if (password.type === "password") {
            password.type = "text";
            icon[0].firstChild.attributes[0].nodeValue = "/img/icons.svg#icon-eye-off";
        } else {
            password.type = "password";
            icon[0].firstChild.attributes[0].nodeValue = "/img/icons.svg#icon-eye";
        }
    });
    icon[1].addEventListener("click", ()=>{
        if (passwordConfirmation.type === "password") {
            passwordConfirmation.type = "text";
            icon[1].firstChild.attributes[0].nodeValue = "/img/icons.svg#icon-eye-off";
        } else {
            passwordConfirmation.type = "password";
            icon[1].firstChild.attributes[0].nodeValue = "/img/icons.svg#icon-eye";
        }
    });
    $0839f7a1410e33a8$var$signUpForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        (0, $570385a58432f766$export$6f5378aa3397b877)(name.value, email.value, password.value, passwordConfirmation.value);
    });
}
if ($0839f7a1410e33a8$var$logoutButton) $0839f7a1410e33a8$var$logoutButton.addEventListener("click", (0, $7483b2cfd4cf6ab9$export$a0973bcfe11b05c9));
if ($0839f7a1410e33a8$var$updateUserForm) $0839f7a1410e33a8$var$updateUserForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const photo = document.getElementById("photo").files[0];
    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("photo", photo);
    (0, $97cbf93f5bf40120$export$ca89bc660948fd97)(form);
});
if ($0839f7a1410e33a8$var$updatePasswordForm) $0839f7a1410e33a8$var$updatePasswordForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const submitButton = document.querySelector(".btn--save-password");
    submitButton.textContent = "Updating...";
    const oldPassword = document.getElementById("password-current");
    const newPassword = document.getElementById("password");
    const newPasswordConfirmation = document.getElementById("password-confirm");
    await (0, $97cbf93f5bf40120$export$e6af0f282bef35a9)(oldPassword.value, newPassword.value, newPasswordConfirmation.value);
    oldPassword.value = "";
    newPassword.value = "";
    newPasswordConfirmation.value = "";
    submitButton.textContent = "Save password";
});
if ($0839f7a1410e33a8$var$bookButton) $0839f7a1410e33a8$var$bookButton.addEventListener("click", async (e)=>{
    e.target.textContent = "Processing...";
    const { tourId: tourId  } = e.target.dataset;
    await (0, $dfa7dc58f59e946c$export$8d5bdbf26681c0c2)(tourId);
});
const $0839f7a1410e33a8$var$alertMessage = document.querySelector("body").dataset.alert;
if ($0839f7a1410e33a8$var$alertMessage) (0, $205558e491d64dcb$export$de026b00723010c1)("success", $0839f7a1410e33a8$var$alertMessage, 10);


//# sourceMappingURL=bundler.js.map
