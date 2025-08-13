// Address Change Request Types

export interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface AddressChangeRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  oldAddress: Address;
  newAddress: Address;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  rejectionReason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressChangeRequest {
  newAddress: Address;
  reason: string;
}

export interface ReviewAddressChangeRequest {
  rejectionReason?: string;
}