import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

const supabase = createClient();

export type Project = Database['public']['Tables']['projects']['Row'] & {
    assets?: Asset[];
};
export type Asset = Database['public']['Tables']['assets']['Row'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectsTable = () => supabase.from('projects') as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assetsTable = () => supabase.from('assets') as any;

export const projectService = {
    // Create a new project (session)
    async createProject(name: string, type: 'image' | 'marketing' = 'image', metadata: Record<string, unknown> = {}) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await projectsTable()
            .insert({
                name,
                user_id: user.id,
                type,
                status: 'pending',
                metadata
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update project
    async updateProject(id: string, updates: { name?: string; status?: 'completed' | 'failed' | 'pending'; metadata?: Record<string, unknown> }) {
        const { error } = await projectsTable()
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    // Delete project
    async deleteProject(id: string) {
        // Delete related assets first (manual cascade)
        const { error: assetError } = await assetsTable()
            .delete()
            .eq('project_id', id);

        if (assetError) console.warn('Error deleting project assets:', assetError);

        const { error } = await projectsTable()
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Add asset to project
    async addAsset(projectId: string, url: string, type: 'source' | 'processed' | 'result', storagePath: string) {
        const { data, error } = await assetsTable()
            .insert({
                project_id: projectId,
                url,
                type,
                storage_path: storagePath
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get user's recent history
    async getHistory(limit = 20): Promise<{ id: string; name: string; created_at: string; status: string; type: string; assets: { type: string; url: string }[] | null }[] | null> {
        const { data, error } = await projectsTable()
            .select(`
                id, name, created_at, status, type,
                assets (type, url)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
};
