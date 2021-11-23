/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// Update Data
export const updateUserData = async data => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Account updated successfully!');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const updateUserPassword = async (
  oldPassword,
  newPassword,
  newPasswordConfirmation
) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
      data: {
        oldPassword,
        newPassword,
        newPasswordConfirmation
      }
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Password updated successfully!');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
