export interface Character {
  id: "role1" | "role2";
  name: string;
  imageUrl: string;
  voiceId: string;
  description?: string;
}

export interface DialogueLine {
  speaker: "role1" | "role2";
  text: string;
  emotion?: string;
  audioUrl?: string;
}

export interface ScriptIdea {
  id: number;
  title: string;
  brief: string;
  dialogue?: DialogueLine[];
}

export interface Story {
  id: string;
  user_id: string;
  main_topic: string | null;
  selected_niche: string | null;
  characters: {
    role1: Character;
    role2: Character;
  };
  script: DialogueLine[] | null;
  video_url: string | null;
  created_at: string;
}
