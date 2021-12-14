/* eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

export const createAccount = async (
  name,
  email,
  password,
  passwordConfirmation
) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirmation
      }
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Account successfully created!');
      window.setTimeout(() => {
        // eslint-disable-next-line no-restricted-globals
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
