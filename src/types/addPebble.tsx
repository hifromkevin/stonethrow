import { AddPebbleError } from '@/types/errors';

export type AddPebbleSuccess = {
  ok: true;
  data: {
    id: string;
    title: string | null;
    canonical_url: string;
    original_url: string;
  };
};

export type AddPebbleFailure = {
  ok: false;
  error: AddPebbleError;
};

export type AddPebbleResult = AddPebbleSuccess | AddPebbleFailure;
