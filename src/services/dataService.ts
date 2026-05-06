import { Shipment, Ticket } from '../types';

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  name?: string;
  phone?: string;
}

class DataService {
  private async handleResponse(res: Response) {
    if (!res.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `Request failed with status ${res.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an unexpected response format');
    }
    
    return res.json();
  }

  // Shipments
  async getShipments(): Promise<Shipment[]> {
    const res = await fetch('/api/shipments');
    return this.handleResponse(res);
  }

  async getShipmentByTrackingId(trackingId: string): Promise<Shipment | null> {
    const res = await fetch(`/api/shipments/${trackingId}`);
    if (res.status === 404) return null;
    return this.handleResponse(res);
  }

  async createShipment(shipmentData: any): Promise<Shipment> {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipmentData)
    });
    return this.handleResponse(res);
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment> {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return this.handleResponse(res);
  }

  async deleteShipment(id: string): Promise<void> {
    const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      await this.handleResponse(res);
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users');
    return this.handleResponse(res);
  }

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    const res = await fetch('/api/tickets');
    return this.handleResponse(res);
  }

  async createTicket(ticketData: any): Promise<Ticket> {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    return this.handleResponse(res);
  }

  async addTicketMessage(id: string, message: any): Promise<Ticket> {
    const res = await fetch(`/api/tickets/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return this.handleResponse(res);
  }

  async updateTicketStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      await this.handleResponse(res);
    }
  }
}

export const dataService = new DataService();
