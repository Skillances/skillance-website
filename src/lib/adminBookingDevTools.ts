import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

export interface BookingDevToolsStatus {
  enabled: boolean;
}

export async function fetchBookingDevToolsStatus(): Promise<BookingDevToolsStatus> {
  const res = await get(ApiPaths.admin.bookingDevToolsStatus);
  const enabled = Boolean((res as { data?: { enabled?: boolean } }).data?.enabled);
  return { enabled };
}

export interface AdvanceBookingSessionForDevResponse {
  bookingId: string;
  status: string;
  sessionPin: string;
  pinWindowStartAt: string;
  pinWindowEndAt: string;
}

export async function advanceBookingSessionForDev(
  bookingId: string,
): Promise<AdvanceBookingSessionForDevResponse> {
  const res = await post(ApiPaths.admin.bookingAdvanceSessionDev(bookingId), {});
  const data = (res as { data?: AdvanceBookingSessionForDevResponse }).data;
  if (!data?.bookingId || !data.sessionPin) {
    throw new Error('Invalid advance-session response');
  }
  return data;
}
