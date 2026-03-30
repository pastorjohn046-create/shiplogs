export type ShipmentStatus = 
  | 'Pending' 
  | 'Warehouse' 
  | 'Customs' 
  | 'Carrier 1' 
  | 'Carrier 2' 
  | 'Shipped' 
  | 'Delivered';

export interface Receipt {
  id: string;
  title: string;
  amount: string;
  date: string;
  fileUrl?: string; // base64 or URL
  description?: string;
}

export interface ShipmentHistory {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  photoUrl?: string;
  description: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  type: 'Flight' | 'Shipment';
  status: ShipmentStatus;
  history: ShipmentHistory[];
  receipts?: Receipt[];
  customerEmail: string;
  userId?: string;
  origin: string;
  destination: string;
  productName?: string;
  productDescription?: string;
  productImage?: string; // base64
  weight?: string;
  dimensions?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  shipmentId?: string;
  customerId: string;
  messages: Message[];
  status: 'open' | 'closed';
  createdAt: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
}
