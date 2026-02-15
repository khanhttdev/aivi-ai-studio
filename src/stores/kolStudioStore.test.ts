import { describe, it, expect, beforeEach } from 'vitest';
import { useKOLStudioStore } from './kolStudioStore';
import { renderHook, act } from '@testing-library/react';
import { KOLEntity } from '@/lib/kol/types';

describe('useKOLStudioStore', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useKOLStudioStore());
        act(() => {
            result.current.reset();
        });
    });

    it('should set selected theme correctly', () => {
        const { result } = renderHook(() => useKOLStudioStore());
        const theme = { id: 'fashion', name: 'Fashion', nameVi: 'Thời trang', description: 'desc', descriptionVi: 'descVi', icon: '👕' };

        act(() => {
            result.current.setSelectedTheme(theme);
        });

        expect(result.current.selectedTheme).toEqual(theme);
    });

    it('should set custom theme correctly', () => {
        const { result } = renderHook(() => useKOLStudioStore());

        act(() => {
            result.current.setCustomTheme('Custom Theme');
        });

        expect(result.current.customTheme).toBe('Custom Theme');
    });

    it('should add a saved KOL to the list', () => {
        const { result } = renderHook(() => useKOLStudioStore());
        const newKOL = { id: '1', name: 'Test KOL', theme: 'fashion' } as unknown as KOLEntity;

        act(() => {
            result.current.addSavedKOL(newKOL);
        });

        expect(result.current.savedKOLs).toHaveLength(1);
        expect(result.current.savedKOLs[0]).toEqual(newKOL);
    });

    it('should reset state correctly', () => {
        const { result } = renderHook(() => useKOLStudioStore());

        act(() => {
            result.current.setKOLName('Test Name');
            result.current.reset();
        });

        expect(result.current.kolName).toBe('');
    });
});
