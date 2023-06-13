/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51Ju4syCxZBGB882laYkpbTlJpD80i5TElbw2A83xJMZAX1hvr5kMoS0fOoGtwtdzK5jj4w3NUoIc3NSOZmbmNaAm00qLIxFEcB'
);

export const bookTour = async (tourId) => {
  try {
    //Get the checkout session from the server(API)
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
