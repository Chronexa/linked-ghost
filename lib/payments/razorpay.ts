import Razorpay from 'razorpay';

export const getRazorpayClient = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn("Razorpay warning: Environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are missing.");
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });
};

export const razorpay = getRazorpayClient();
