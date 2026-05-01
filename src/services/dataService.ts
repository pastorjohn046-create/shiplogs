import { Shipment, Ticket } from '../types';

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  name?: string;
  phone?: string;
}

class DataService {
  // Shipments
  async getShipments(): Promise<Shipment[]> {
    const res = await fetch('/api/shipments');
    if (!res.ok) throw new Error('Failed to fetch shipments');
    return res.json();
  }

  async getShipmentByTrackingId(trackingId: string): Promise<Shipment | null> {
    const res = await fetch(`/api/shipments/${trackingId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch shipment');
    return res.json();
  }

  async createShipment(shipmentData: any): Promise<Shipment> {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipmentData)
    });
    if (!res.ok) throw new Error('Failed to create shipment');
    return res.json();
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment> {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update shipment');
    return res.json();
  }

  async deleteShipment(id: string): Promise<void> {
    const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete shipment');
  }

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    const res = await fetch('/api/tickets');
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  }

  async createTicket(ticketData: any): Promise<Ticket> {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    return res.json();
  }

  async addTicketMessage(id: string, message: any): Promise<Ticket> {
    const res = await fetch(`/api/tickets/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }

  async updateTicketStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update ticket status');
  }
}

export const dataService = new DataService();
