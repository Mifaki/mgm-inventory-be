import { ApiResponse } from "@/models/general";
import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  data?: any
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(data && { data }),
  };

  res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): void => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const response: ApiResponse<T[]> = {
    success: true,
    ...(message && { message }),
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
  };

  res.status(200).json(response);
};
