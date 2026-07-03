import { revalidatePath } from "next/cache";

export function revalidatePublicProfile(
  username: string,
  oldUsername?: string,
): void {
  revalidatePath(`/@${username}`);
  revalidatePath(`/profile/${username}`);

  if (oldUsername && oldUsername !== username) {
    revalidatePath(`/@${oldUsername}`);
    revalidatePath(`/profile/${oldUsername}`);
  }
}

export function revalidatePublicRecord(
  username: string,
  recordId: string,
): void {
  revalidatePath(`/@${username}/${recordId}`);
  revalidatePath(`/profile/${username}/${recordId}`);
  revalidatePublicProfile(username);
}
