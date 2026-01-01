import { AddPebbleError } from '@/types';

export function getAddPebbleErrorMessage(error: AddPebbleError): string {
  switch (error) {
    case 'UNAUTHORIZED':
      return 'Please sign in to add a Pebble.';

    case 'DUPLICATE':
      return 'You already saved this link.';

    case 'INVALID_INPUT':
      return 'That link doesn’t look valid.';

    case 'INVALID_REFERENCE':
      return 'This link references something invalid.';

    case 'DB_ERROR':
    default:
      return 'We couldn’t save this link right now. Please try again.';
  }
}
