export interface StoryDraft {
    id: string;
    title: string;
    // Add other properties as needed based on usage
    updated_at: string;
    created_at: string;
    status: string;
    genre?: string;
}

// Extend StoryDraft if needed, or use specific type
export type Story = StoryDraft; 
