import { describe, it, expect } from 'vitest';
import {
  authError,
  validationError,
  actionError,
  success,
  handleError,
} from './errorHandler';

describe('errorHandler', () => {
  describe('authError', () => {
    it('should return auth error response', () => {
      const result = authError();
      expect(result.success).toBe(false);
      expect(result.error).toBe('認証が必要です');
    });
  });

  describe('validationError', () => {
    it('should return validation error response', () => {
      const result = validationError('Invalid input');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input');
    });
  });

  describe('actionError', () => {
    it('should return action error response', () => {
      const result = actionError('Action failed');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Action failed');
    });
  });

  describe('success', () => {
    it('should return success response without data', () => {
      const result = success();
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should return success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = success(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('handleError', () => {
    it('should handle Error instance', () => {
      const error = new Error('Test error');
      const result = handleError(error);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should handle unknown error', () => {
      const result = handleError('Unknown error');
      expect(result.success).toBe(false);
      expect(result.error).toBe('予期しないエラーが発生しました');
    });
  });
});
