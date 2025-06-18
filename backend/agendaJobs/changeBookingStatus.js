import agenda from './agendaInstance.js';
import Booking from '../Models/Booking.js'; // adjust the path

// Define the job
agenda.define('expire booking', async (job) => {
  const { bookingId } = job.attrs.data;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.warn(`Booking ${bookingId} not found.`);
      return;
    }

    if (booking.status === 'approved') {
      booking.status = 'completed';
      console.log(`Booking ${bookingId} was approved — marked as completed.`);
    } else {
      booking.status = 'expired';
      console.log(`Booking ${bookingId} was not approved — marked as expired.`);
    }

    await booking.save();
  } catch (error) {
    console.error(`Failed to process booking ${bookingId}:`, error);
  }
});
