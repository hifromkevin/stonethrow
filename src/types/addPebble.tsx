import { AddPebbleError } from '@/types';
import { Pebble } from '@/types';

export type AddPebbleSuccess = {
  ok: true;
  data: Pebble[];
};

export type AddPebbleFailure = {
  ok: false;
  error: AddPebbleError;
};

export type AddPebbleResult = AddPebbleSuccess | AddPebbleFailure;
