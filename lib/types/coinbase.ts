export interface CoinbaseChargeResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  pricing_type: "fixed_price" | "no_price";
  pricing?: {
    local: {
      amount: string;
      currency: string;
    };
    settlement: {
      amount: string;
      currency: string;
    };
  };
  timeline: Array<{
    status: "NEW" | "PENDING" | "COMPLETED" | "EXPIRED" | "FAILED" | "SIGNED";
    time: string;
  }>;
  web3_data?: {
    success_events?: Array<{
      finalized: boolean;
      input_token_address: string;
      input_token_amount: string;
      network_fee_paid: string;
      recipient: string;
      sender: string;
      timestamp: string;
      tx_hash: string;
    }>;
    failure_events?: Array<{
      input_token_address: string;
      network_fee_paid: string;
      reason: string;
      sender: string;
      timestamp: string;
      tx_hash: string;
    }>;
  };
  created_at: string;
  expires_at: string;
  confirmed_at?: string;
}
