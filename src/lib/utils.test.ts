import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('text-red-500', 'bg-blue-500');
            expect(result).toBe('text-red-500 bg-blue-500');
        });

        it('should handle conditional classes', () => {
            const condition = true;
            const result = cn('text-red-500', condition && 'bg-blue-500');
            expect(result).toBe('text-red-500 bg-blue-500');
        });

        it('should handle false conditional classes', () => {
            const condition = false;
            const result = cn('text-red-500', condition && 'bg-blue-500');
            expect(result).toBe('text-red-500');
        });

        it('should merge tailwind classes using tailwind-merge (handle conflicts)', () => {
            const result = cn('p-4', 'p-8');
            expect(result).toBe('p-8');
        });

        it('should handle arrays and objects if supported by clsx', () => {
            const result = cn(['text-red-500', 'bg-blue-500']);
            expect(result).toBe('text-red-500 bg-blue-500');
        });
    });
});
