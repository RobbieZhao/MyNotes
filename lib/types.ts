export type Note = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NoteSummary = Pick<Note, "id" | "title" | "slug" | "updated_at">;

export type SaveStatus = "idle" | "saving" | "saved" | "error";
