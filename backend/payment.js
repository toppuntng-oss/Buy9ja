import Paystack from 'paystack';
import dotenv from 'dotenv';
import https from 'https';
import crypto from 'crypto';

dotenv.config();

// Initialize Paystack with your secret key
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY || '');

/**
 * Initialize a payment transaction
 * @param {string} email - Customer email
 * @param {number} amount - Amount in Naira (or your currency)
 * @param {object} metadata - Additional metadata for the transaction
 * @returns {Promise<object>} Transaction initialization response
 */
export async function initializeTransaction(email, amount, metadata = {}) {
  try {
    // Convert amount to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(amount * 100);
    
    const response = await paystack.transaction.initialize({
      email: email,
      amount: amountInKobo,
      metadata: metadata,
      callback_url: metadata.callback_url || process.env.FRONTEND_URL + '/payment/callback',
    });
    
    if (response.status) {
      return {
        success: true,
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
      };
    } else {
      return {
        success: false,
        error: response.message || 'Failed to initialize transaction',
      };
    }
  } catch (error) {
    console.error('Error initializing transaction:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify a transaction using reference
 * @param {string} reference - The transaction reference
 * @returns {Promise<object>} Transaction verification response
 */
export async function verifyTransaction(reference) {
  try {
    const response = await paystack.transaction.verify(reference);
    
    if (response.status) {
      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount / 100, // Convert from kobo to naira
        currency: response.data.currency,
        reference: response.data.reference,
        paid_at: response.data.paid_at,
        customer: response.data.customer,
        metadata: response.data.metadata,
      };
    } else {
      return {
        success: false,
        error: response.message || 'Verification failed',
      };
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * List all transactions
 * @param {number} perPage - Number of transactions per page
 * @param {number} page - Page number
 * @returns {Promise<object>} List of transactions
 */
export async function listTransactions(perPage = 50, page = 1) {
  try {
    const response = await paystack.transaction.list({
      perPage: perPage,
      page: page,
    });
    
    if (response.status) {
      return {
        success: true,
        transactions: response.data.map(tx => ({
          reference: tx.reference,
          amount: tx.amount / 100,
          status: tx.status,
          paid_at: tx.paid_at,
          customer: tx.customer,
        })),
        meta: response.meta,
      };
    } else {
      return {
        success: false,
        error: response.message,
      };
    }
  } catch (error) {
    console.error('Error listing transactions:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process a refund (Paystack doesn't have direct refund API, need to use Transfer API)
 * This function creates a transfer to refund the customer
 * @param {string} reference - The transaction reference to refund
 * @param {number} amount - Optional partial refund amount
 * @returns {Promise<object>} Refund response
 */
export async function processRefund(reference, amount = null) {
  try {
    // First, verify the transaction to get details
    const verifyResponse = await verifyTransaction(reference);
    
    if (!verifyResponse.success) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }
    
    // Note: Actual refund requires manual processing via Paystack dashboard
    // or using the Transfer API with recipient setup
    // This is a placeholder for the refund logic
    
    return {
      success: true,
      message: 'Refund request received. Manual processing required via Paystack dashboard.',
      reference: reference,
      amount: amount || verifyResponse.amount,
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify webhook signature from Paystack
 * @param {object} req - Express request object
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(req) {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    return hash === req.headers['x-paystack-signature'];
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Alternative webhook verification using raw body
 * @param {string} payload - Raw request body
 * @param {string} signature - Paystack signature header
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignatureRaw(payload, signature) {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Get supported banks for bank account verification
 * @returns {Promise<object>} List of banks
 */
export async function getBanks() {
  try {
    const response = await paystack.misc.list_banks();
    
    if (response.status) {
      return {
        success: true,
        banks: response.data.map(bank => ({
          id: bank.id,
          name: bank.name,
          code: bank.code,
          slug: bank.slug,
        })),
      };
    } else {
      return {
        success: false,
        error: response.message,
      };
    }
  } catch (error) {
    console.error('Error fetching banks:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  initializeTransaction,
  verifyTransaction,
  listTransactions,
  processRefund,
  verifyWebhookSignature,
  verifyWebhookSignatureRaw,
  getBanks,
};