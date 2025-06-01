import { BasePagination } from "./general";

export interface ItemData {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedItemsResult {
  items: ItemData[];
  pagination: BasePagination;
}
