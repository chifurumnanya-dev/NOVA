import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, HTTP } from './index';

describe('API Response Helpers', () => {
  it('should create a success response', () => {
    const data = { id: 1, name: 'Test' };
    const response = successResponse(data, { message: 'Success' });
    
    expect(response).toEqual({
      success: true,
      data,
      meta: { message: 'Success' },
    });
  });

  it('should create an error response', () => {
    const response = errorResponse('Something went wrong', 'ERROR_CODE', { detail: 'more info' });
    
    expect(response).toEqual({
      success: false,
      error: {
        code: 'ERROR_CODE',
        message: 'Something went wrong',
        details: { detail: 'more info' },
      },
    });
  });

  it('should create a paginated response', () => {
    const data = [{ id: 1 }];
    const response = paginatedResponse(data, 100, 1, 20);
    
    expect(response).toEqual({
      success: true,
      data,
      meta: {
        page: 1,
        limit: 20,
        total: 100,
        total_pages: 5,
        has_next_page: true,
      },
    });
  });
});

describe('Pagination Utilities', () => {
  it('should parse pagination params with defaults', () => {
    const params = getPaginationParams(new URLSearchParams());
    expect(params).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('should parse custom pagination params', () => {
    const searchParams = new URLSearchParams('page=2&limit=50');
    const params = getPaginationParams(searchParams);
    expect(params).toEqual({ page: 2, limit: 50, offset: 50 });
  });

  it('should enforce max limit', () => {
    const searchParams = new URLSearchParams('limit=1000');
    const params = getPaginationParams(searchParams);
    expect(params.limit).toBe(100);
  });
});
