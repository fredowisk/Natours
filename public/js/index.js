/* eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateUserData, updateUserPassword } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { createAccount } from './signUp';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--sign-up');
const logoutButton = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const bookButton = document.getElementById('book-tour');

//Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  const input = document.getElementsByTagName('input')[1];

  const icon = document.getElementById('password-icon');

  icon.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      icon.firstChild.attributes[0].nodeValue = '/img/icons.svg#icon-eye-off';
    } else {
      input.type = 'password';
      icon.firstChild.attributes[0].nodeValue = '/img/icons.svg#icon-eye';
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signUpForm) {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const passwordConfirmation = document.getElementById('passwordConfirmation');

  const icon = document.querySelectorAll('#password-icon');

  icon[0].addEventListener('click', () => {
    if (password.type === 'password') {
      password.type = 'text';
      icon[0].firstChild.attributes[0].nodeValue =
        '/img/icons.svg#icon-eye-off';
    } else {
      password.type = 'password';
      icon[0].firstChild.attributes[0].nodeValue = '/img/icons.svg#icon-eye';
    }
  });

  icon[1].addEventListener('click', () => {
    if (passwordConfirmation.type === 'password') {
      passwordConfirmation.type = 'text';
      icon[1].firstChild.attributes[0].nodeValue =
        '/img/icons.svg#icon-eye-off';
    } else {
      passwordConfirmation.type = 'password';
      icon[1].firstChild.attributes[0].nodeValue = '/img/icons.svg#icon-eye';
    }
  });

  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    createAccount(
      name.value,
      email.value,
      password.value,
      passwordConfirmation.value
    );
  });
}

if (logoutButton) logoutButton.addEventListener('click', logout);

if (updateUserForm)
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];

    const form = new FormData();
    form.append('name', name);
    form.append('email', email);

    form.append('photo', photo);

    updateUserData(form);
  });

if (updatePasswordForm)
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = document.querySelector('.btn--save-password');

    submitButton.textContent = 'Updating...';

    const oldPassword = document.getElementById('password-current');
    const newPassword = document.getElementById('password');
    const newPasswordConfirmation = document.getElementById('password-confirm');
    await updateUserPassword(
      oldPassword.value,
      newPassword.value,
      newPasswordConfirmation.value
    );

    oldPassword.value = '';
    newPassword.value = '';
    newPasswordConfirmation.value = '';
    submitButton.textContent = 'Save password';
  });

if (bookButton) {
  bookButton.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    console.log(e.target.dataset);
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) {
  showAlert('success', alertMessage, 10);
}
