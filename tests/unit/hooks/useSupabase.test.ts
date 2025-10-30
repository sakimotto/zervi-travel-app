import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseTable } from '../../../src/hooks/useSupabase';
import { supabase } from '../../../src/lib/supabase';

vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useSupabaseTable', () => {
  const mockTableName = 'destinations';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchData', () => {
    it('should fetch data on mount', async () => {
      const mockData = [
        { id: '1', name: 'Beijing', created_at: '2024-01-01' },
        { id: '2', name: 'Shanghai', created_at: '2024-01-02' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(supabase.from).toHaveBeenCalledWith(mockTableName);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Network error');

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.data).toEqual([]);
    });

    it('should handle null data response', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('insert', () => {
    it('should insert a new record', async () => {
      const mockData = [
        { id: '1', name: 'Beijing', created_at: '2024-01-01' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newRecord = { name: 'Guangzhou', description: 'New city' };
      const insertedRecord = { id: '3', name: 'Guangzhou', created_at: '2024-01-03' };

      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: insertedRecord, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockInsertSelect,
        single: mockSingle,
      } as any);

      const insertResult = await result.current.insert(newRecord as any);

      expect(supabase.from).toHaveBeenCalledWith(mockTableName);
      expect(mockInsert).toHaveBeenCalled();
      expect(mockInsertSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(insertResult).toEqual(insertedRecord);
    });

    it('should clean up undefined and null values before insert', async () => {
      const mockData: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newRecord = {
        name: 'Test',
        description: undefined,
        notes: null,
        value: '',
        valid: 'data',
      };

      let capturedInsertData: any;
      const mockInsert = vi.fn().mockImplementation((data) => {
        capturedInsertData = data;
        return {
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        };
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await result.current.insert(newRecord as any);

      expect(capturedInsertData).toEqual({ name: 'Test', valid: 'data' });
      expect(capturedInsertData).not.toHaveProperty('description');
      expect(capturedInsertData).not.toHaveProperty('notes');
      expect(capturedInsertData).not.toHaveProperty('value');
    });

    it('should handle insert errors', async () => {
      const mockData: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockError = new Error('Insert failed');
      const mockInsert = vi.fn().mockReturnThis();
      const mockInsertSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockInsertSelect,
        single: mockSingle,
      } as any);

      await expect(result.current.insert({ name: 'Test' } as any)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const mockData = [
        { id: '1', name: 'Beijing', created_at: '2024-01-01' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { name: 'Beijing Updated' };
      const updatedRecord = { id: '1', name: 'Beijing Updated', created_at: '2024-01-01' };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockUpdateSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedRecord, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockUpdateSelect,
        single: mockSingle,
      } as any);

      const updateResult = await result.current.update('1', updates as any);

      expect(supabase.from).toHaveBeenCalledWith(mockTableName);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockUpdateSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(updateResult).toEqual(updatedRecord);
    });

    it('should convert undefined and empty strings to null in updates', async () => {
      const mockData: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = {
        name: 'Test',
        description: undefined,
        notes: '',
        value: 'data',
      };

      let capturedUpdateData: any;
      const mockUpdate = vi.fn().mockImplementation((data) => {
        capturedUpdateData = data;
        return {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        };
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      await result.current.update('1', updates as any);

      expect(capturedUpdateData.name).toBe('Test');
      expect(capturedUpdateData.description).toBeNull();
      expect(capturedUpdateData.notes).toBeNull();
      expect(capturedUpdateData.value).toBe('data');
    });

    it('should handle update errors', async () => {
      const mockData: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockError = new Error('Update failed');
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockUpdateSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockUpdateSelect,
        single: mockSingle,
      } as any);

      await expect(result.current.update('1', { name: 'Test' } as any)).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBe('Update failed');
      });
    });
  });

  describe('remove', () => {
    it('should delete a record', async () => {
      const mockData = [
        { id: '1', name: 'Beijing', created_at: '2024-01-01' },
        { id: '2', name: 'Shanghai', created_at: '2024-01-02' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      await result.current.remove('1');

      expect(supabase.from).toHaveBeenCalledWith(mockTableName);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle delete errors', async () => {
      const mockData: any[] = [];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const mockError = new Error('Delete failed');
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      await expect(result.current.remove('1')).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed');
      });
    });
  });

  describe('refetch', () => {
    it('should refetch data when called', async () => {
      const initialData = [{ id: '1', name: 'Beijing', created_at: '2024-01-01' }];
      const newData = [
        { id: '1', name: 'Beijing', created_at: '2024-01-01' },
        { id: '2', name: 'Shanghai', created_at: '2024-01-02' },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi
        .fn()
        .mockResolvedValueOnce({ data: initialData, error: null })
        .mockResolvedValueOnce({ data: newData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const { result } = renderHook(() => useSupabaseTable(mockTableName));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(initialData);

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual(newData);
      });

      expect(mockOrder).toHaveBeenCalledTimes(2);
    });
  });
});
