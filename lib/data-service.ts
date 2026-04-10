import { supabase } from './supabase';
import { FoodRequest, RequestStatus } from './types';

// Helper to map Frontend (camelCase) to Database (snake_case)
const mapRequestToDb = (req: Partial<FoodRequest>) => {
  const mapped: any = {};
  if (req.id !== undefined) mapped.id = req.id;
  if (req.requestNumber !== undefined) mapped.request_number = req.requestNumber;
  if (req.donorName !== undefined) mapped.donor_name = req.donorName;
  if (req.donorType !== undefined) mapped.donor_type = req.donorType;
  if (req.phone !== undefined) mapped.phone = req.phone;
  if (req.district !== undefined) mapped.district = req.district;
  if (req.googleMapsLink !== undefined) mapped.google_maps_link = req.googleMapsLink;
  if (req.pickupTime !== undefined) mapped.pickup_time = req.pickupTime;
  if (req.currentStatus !== undefined) mapped.current_status = req.currentStatus;
  if (req.priorityLevel !== undefined) mapped.priority_level = req.priorityLevel;
  if (req.pickupCourierId !== undefined) mapped.pickup_courier_id = req.pickupCourierId;
  if (req.pickupCourierName !== undefined) mapped.pickup_courier_name = req.pickupCourierName;
  if (req.images !== undefined) mapped.images = req.images;
  if (req.createdAt !== undefined) mapped.created_at = req.createdAt;
  if (req.updatedAt !== undefined) mapped.updated_at = req.updatedAt;
  return mapped;
};

// Helper to map Database (snake_case) to Frontend (camelCase)
const mapRequestFromDb = (row: any): FoodRequest => {
  if (!row) return row;
  return {
    id: row.id,
    requestNumber: row.request_number,
    donorName: row.donor_name,
    donorType: row.donor_type,
    phone: row.phone,
    district: row.district,
    googleMapsLink: row.google_maps_link,
    pickupTime: row.pickup_time,
    currentStatus: row.current_status,
    priorityLevel: row.priority_level,
    pickupCourierId: row.pickup_courier_id,
    pickupCourierName: row.pickup_courier_name,
    images: row.images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const DataService = {
  // --- Requests ---
  async getRequests() {
    const { data, error } = await supabase
      .from('food_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
    return (data || []).map(mapRequestFromDb);
  },

  async getRequestById(id: string) {
    const { data, error } = await supabase
      .from('food_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching request by ID:', error);
      return null;
    }
    return mapRequestFromDb(data);
  },

  async addRequest(request: FoodRequest) {
    const dbRecord = mapRequestToDb(request);
    
    // Use the ID provided by the frontend. 
    // This fixes the 'null value in column id' error because the table doesn't have an auto-generator.

    const { error } = await supabase
      .from('food_requests')
      .insert([dbRecord]);

    if (error) {
      console.error('Error adding request:', error);
      throw new Error(error.message || 'حدث خطأ أثناء إضافة الطلب في قاعدة البيانات');
    }
    return true;
  },

  async updateRequestStatus(id: string, updates: Partial<FoodRequest>) {
    const dbUpdates = mapRequestToDb(updates);
    const { error } = await supabase
      .from('food_requests')
      .update({ ...dbUpdates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating request:', error);
      throw error;
    }
    return true;
  },

  async deleteRequest(id: string) {
    const { error } = await supabase
      .from('food_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
    return true;
  },

  async deleteAllRequests() {
    const { error } = await supabase
      .from('food_requests')
      .delete()
      .neq('id', '0');

    if (error) {
      console.error('Error clearing requests:', error);
      throw error;
    }
    return true;
  },

  // --- Locations ---
  async updateCourierLocation(courierId: string, lat: number, lng: number) {
    const { error } = await supabase
      .from('courier_locations')
      .upsert({ 
        courier_id: courierId, 
        lat, 
        lng, 
        updated_at: new Date().toISOString() 
      });

    if (error) {
       console.error('Error updating location:', error);
    }
  },

  async getCourierLocations() {
    const { data, error } = await supabase
      .from('courier_locations')
      .select('*');

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
    return data;
  },

  // --- Realtime Subscriptions ---
  subscribeToRequests(callback: (payload: any) => void) {
    return supabase
      .channel('public:food_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_requests' }, (payload) => {
        const mappedPayload = { ...payload };
        if (payload.new) mappedPayload.new = mapRequestFromDb(payload.new);
        if (payload.old) mappedPayload.old = mapRequestFromDb(payload.old);
        callback(mappedPayload);
      })
      .subscribe();
  }
};
